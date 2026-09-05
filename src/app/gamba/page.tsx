'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSpeechRecognition, useSpeechSynthesis } from './useSpeech';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const GREETING =
  'おっ、来てくれたんか！ワイはガンバくん、ガンバ大阪一筋のサポーターやで。自分、好きな選手おる？';

const ASK_AGAIN = 'ごめん、今の聞き取れんかったわ。もっかい言うて。';
const NO_MIC_INPUT = '声、拾えてへんっぽいわ。マイクの許可とか、繋がってるか確認してみてくれるか？';
const VOICE_TEST_PHRASE = 'おっ、聞こえてるか？ワイの声やで。';

const quickPrompts = [
  '好きな選手の話しよか',
  'パナスタってどんなとこ？',
  '大阪ダービーってどんな感じ？',
  '2005年の優勝の話して',
];

/** ストリームの途中経過から、読み上げに回せる「文が完成した分」だけを取り出す。 */
function takeCompletedSentences(buffer: string): { sentences: string[]; rest: string } {
  const sentences: string[] = [];
  let rest = buffer;

  for (;;) {
    const match = rest.match(/^[\s\S]*?[。！？!?\n]/);
    if (!match) break;
    const sentence = match[0].trim();
    if (sentence) sentences.push(sentence);
    rest = rest.slice(match[0].length);
  }

  return { sentences, rest };
}

export default function GambaPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'model', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [greeted, setGreeted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const { supported: ttsSupported, speaking, speak, cancel, japaneseVoiceCount } = useSpeechSynthesis();
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  // loading（state）だけで連打を防ごうとすると、React の再描画が間に合わない
  // 一瞬の間に同じクロージャが2回呼ばれてリクエストが二重に飛ぶことがある。
  // ref なら同期的に読み書きできるので、この隙間を作らない。
  const sendingRef = useRef(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sendingRef.current) return;
      sendingRef.current = true;

      cancel();

      const nextMessages: Message[] = [...messagesRef.current, { role: 'user', content: trimmed }];
      setMessages([...nextMessages, { role: 'model', content: '' }]);
      setInput('');
      setLoading(true);

      try {
        const response = await fetch('/api/chat/gamba', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (!response.ok || !response.body) throw new Error('API error');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        let speechBuffer = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          speechBuffer += chunk;

          // 文が完成した順に読み上げへ流すと、体感の待ち時間が大きく減る。
          const { sentences, rest } = takeCompletedSentences(speechBuffer);
          speechBuffer = rest;
          if (voiceEnabled) sentences.forEach(speak);

          setMessages([...nextMessages, { role: 'model', content: full }]);
        }

        const tail = speechBuffer.trim();
        if (voiceEnabled && tail) speak(tail);

        if (!full.trim()) {
          setMessages([...nextMessages, { role: 'model', content: ASK_AGAIN }]);
        }
      } catch {
        const fallback = 'ごめん、電波悪いんかな。もっかい話しかけてくれる？';
        setMessages([...nextMessages, { role: 'model', content: fallback }]);
        if (voiceEnabled) speak(fallback);
      } finally {
        sendingRef.current = false;
        setLoading(false);
      }
    },
    [cancel, speak, voiceEnabled],
  );

  const {
    supported: sttSupported,
    listening,
    interimText,
    error: sttError,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({
    onFinalResult: (transcript) => {
      // ハンズフリー中はマイクを止めずに喋らせているので、ボット自身の読み上げ声を
      // 拾ってしまわないよう、喋っている間の認識結果はここで捨てる。
      if (speakingRef.current) return;

      // 認識結果が空・極端に短いときは API に投げず、その場で聞き返す。
      if (transcript.trim().length < 2) {
        setMessages((prev) => [...prev, { role: 'model', content: ASK_AGAIN }]);
        if (voiceEnabled) speak(ASK_AGAIN);
        return;
      }
      sendMessage(transcript);
    },
    onSilence: () => {
      // マイクを開いたのに一言も拾えなかった。許可切れや無音を疑ってその旨を伝える。
      setMessages((prev) => [...prev, { role: 'model', content: NO_MIC_INPUT }]);
      if (voiceEnabled) speak(NO_MIC_INPUT);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  // ハンズフリーは「ユーザーがボタンを押した一度だけ」recognition.start() を呼び、
  // あとは continuous モードでマイクを開けっぱなしにする。モバイルブラウザの多くは
  // ユーザー操作を伴わない start() を無視するため、セッションが途中で切れたときに
  // 何度も黙って再試行し続けると「ハンズフリーは ON のまま実際は聞こえていない」
  // という一番分かりにくい状態になる。なので再試行の回数に上限を設け、それでも
  // 実際に聞き取りが始まった証拠（listening）が取れなければ諦めて、
  // ハンズフリーを OFF にした上でユーザーに手動での再開を促す。
  const handsFreeRef = useRef(handsFree);
  handsFreeRef.current = handsFree;
  const listeningRef = useRef(listening);
  listeningRef.current = listening;

  const attemptHandsFreeResume = useCallback(
    (attempt: number) => {
      if (!handsFreeRef.current) return;

      if (attempt > 3) {
        setHandsFree(false);
        const msg = 'マイクが切れてもうて、繋ぎ直されへんかったわ。ハンズフリーをもう一回押して再開してくれるか。';
        setMessages((prev) => [...prev, { role: 'model', content: msg }]);
        if (voiceEnabled) speak(msg);
        return;
      }

      startListening({ continuous: true });
      setTimeout(() => {
        if (handsFreeRef.current && !listeningRef.current) {
          attemptHandsFreeResume(attempt + 1);
        }
      }, 1200);
    },
    [startListening, voiceEnabled, speak],
  );

  useEffect(() => {
    if (!handsFree || listening) return;
    const timer = setTimeout(() => attemptHandsFreeResume(1), 500);
    return () => clearTimeout(timer);
  }, [handsFree, listening, attemptHandsFreeResume]);

  // 自動再生はブラウザに止められるので、最初の挨拶はユーザー操作のときに読み上げる。
  const speakGreetingOnce = useCallback(() => {
    if (greeted || !voiceEnabled) return;
    setGreeted(true);
    speak(GREETING);
  }, [greeted, voiceEnabled, speak]);

  const handleMicToggle = () => {
    if (listening) {
      stopListening();
      setHandsFree(false);
      return;
    }
    cancel();
    speakGreetingOnce();
    startListening();
  };

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      if (prev) cancel();
      return !prev;
    });
  };

  const handleSubmit = (text: string) => {
    speakGreetingOnce();
    sendMessage(text);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header />

      <div className="mt-8 flex flex-col md:flex-row gap-6 items-start">
        {/* 左カラム: 紹介と音声設定 */}
        <aside className="w-full md:w-2/5 space-y-4">
          <div className="gl-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-gamba-blue)] flex items-center justify-center text-white font-bold text-2xl shrink-0">
              ガ
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">ガンバくん</h1>
              <p className="text-xs text-green-500 font-medium">
                {listening ? '聞いてるで' : speaking ? '喋ってるで' : 'オンライン'}
              </p>
            </div>
          </div>

          <div className="gl-card">
            <p className="text-text-secondary text-sm leading-relaxed">
              ガンバ大阪一筋、パナソニックスタジアム吹田の北側ゴール裏が定位置。マイクを押して話しかけたら、
              スタジアムの隣の席で喋ってるみたいに返してくれるで。
            </p>
          </div>

          <div className="gl-card space-y-3">
            <h2 className="text-sm font-bold text-text-primary">音声の設定</h2>
            <button
              onClick={toggleVoice}
              className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-border text-text-secondary hover:border-[var(--color-gamba-blue)] transition-colors"
            >
              <span className="flex items-center gap-2">
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                読み上げ
              </span>
              <span className={voiceEnabled ? 'text-green-500' : 'text-text-muted'}>
                {voiceEnabled ? 'オン' : 'オフ'}
              </span>
            </button>
            {ttsSupported && (
              <button
                onClick={() => speak(VOICE_TEST_PHRASE)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-dashed border-border text-text-secondary hover:border-[var(--color-gamba-blue)] hover:text-[var(--color-gamba-blue)] transition-colors"
              >
                声のテスト再生
              </button>
            )}
            <button
              onClick={() =>
                setHandsFree((prev) => {
                  if (prev) {
                    stopListening();
                  } else {
                    // このクリックがユーザー操作そのものなので、ここで一度だけ
                    // start() すれば、以降はマイクを開けっぱなしにできる。
                    speakGreetingOnce();
                    cancel();
                    startListening({ continuous: true });
                  }
                  return !prev;
                })
              }
              disabled={!sttSupported}
              className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-border text-text-secondary hover:border-[var(--color-gamba-blue)] transition-colors disabled:opacity-40"
            >
              <span className="flex items-center gap-2">
                <Mic size={14} />
                ハンズフリー
              </span>
              <span className={handsFree ? 'text-green-500' : 'text-text-muted'}>
                {handsFree ? 'オン' : 'オフ'}
              </span>
            </button>
            {!sttSupported && (
              <p className="text-xs text-text-muted leading-relaxed">
                このブラウザは音声入力に対応してへんわ。Chrome か Edge やったら喋れるで。入力欄からは今でも話しかけられる。
              </p>
            )}
            {!ttsSupported && (
              <p className="text-xs text-text-muted leading-relaxed">
                このブラウザは読み上げに対応してへんから、文字だけになるわ。堪忍な。
              </p>
            )}
            {ttsSupported && japaneseVoiceCount === 0 && (
              <p className="text-xs text-amber-500 leading-relaxed">
                このパソコンに日本語の読み上げボイスが入ってへんみたいや。「声のテスト再生」を押して音が出るか確認してみて。
                出えへんかったら、Windows なら設定の「時刻と言語」→「音声認識」から日本語ボイスを追加してくれるか、
                Edge やと最初から入ってることが多いから、そっちも試してみてな。
              </p>
            )}
            {sttError && <p className="text-xs text-red-500 leading-relaxed">{sttError}</p>}
          </div>

          <div className="gl-card">
            <h2 className="text-sm font-bold text-text-primary mb-3">こんな話ができるで</h2>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  disabled={loading}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-border text-text-secondary hover:border-[var(--color-gamba-blue)] hover:text-[var(--color-gamba-blue)] transition-colors disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 右カラム: 会話 */}
        <div className="w-full md:w-3/5 gl-card flex flex-col h-[60vh] md:h-[calc(100vh-12rem)]">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-gamba-blue)] flex items-center justify-center text-white font-bold text-xs mr-2 shrink-0 self-end mb-1">
                    ガ
                  </div>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-xs md:max-w-sm text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-gamba-blue)] text-white rounded-br-sm'
                      : 'bg-background-muted text-text-primary border border-border rounded-bl-sm'
                  }`}
                >
                  {msg.content || (
                    <span className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {interimText && (
              <div className="flex justify-end">
                <div className="px-4 py-2.5 rounded-2xl rounded-br-sm max-w-xs md:max-w-sm text-sm leading-relaxed border border-dashed border-[var(--color-gamba-blue)] text-text-secondary">
                  {interimText}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="pt-3 flex gap-2 overflow-x-auto shrink-0">
            {quickPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSubmit(prompt)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-[var(--color-gamba-blue)] hover:text-[var(--color-gamba-blue)] transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-border mt-3 shrink-0">
            <div className="flex items-center gap-2 bg-background-muted rounded-full border border-border px-3 py-2">
              <button
                onClick={handleMicToggle}
                disabled={!sttSupported || loading}
                title={listening ? 'マイクを止める' : 'マイクで話しかける'}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-colors disabled:opacity-40 ${
                  listening
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-[var(--color-gamba-blue)] hover:bg-[var(--color-gamba-blue-dark)]'
                }`}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) handleSubmit(input);
                }}
                placeholder={listening ? '聞いてるで…' : 'ガンバくんに話しかける…'}
                className="flex-1 bg-transparent text-text-primary text-sm focus:outline-none placeholder:text-text-muted"
              />
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-[var(--color-gamba-blue)] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[var(--color-gamba-blue-dark)] transition-colors shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
