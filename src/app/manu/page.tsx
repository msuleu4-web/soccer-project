'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const sampleQuestions = [
  'カントナのカラテキックについて',
  'ファーガソン時代のベスト11は？',
  '今シーズンの調子はどう？',
  'リヴァプール戦の歴史',
  'Old Trafford の魅力',
  '次に来そうな若手選手',
];

const legends = [
  { name: 'エリック・カントナ', era: '1992–1997' },
  { name: 'デイビッド・ベッカム', era: '1993–2003' },
  { name: 'クリスティアーノ・ロナウド', era: '2003–2009' },
  { name: 'ウェイン・ルーニー', era: '2004–2017' },
  { name: 'アレックス・ファーガソン監督', era: '1986–2013' },
];

const quickPrompts = ['カントナについて', '今シーズンの成績は？', '次の試合いつ？', 'ライバルはどこ？'];

export default function ManuPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'よっ！マンUくんだぜ！🔴⚪ 何でも聞いてくれよな〜' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/manu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      setMessages([...newMessages, data]);
    } catch {
      setMessages([...newMessages, { role: 'model', content: 'ごめん、ちょっとエラーが出ちゃったぜ…もう一回試してみてくれ！' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      <div className="mt-8 flex flex-col md:flex-row gap-6 items-start">

        {/* 左カラム: 紹介 (40%) */}
        <aside className="w-full md:w-2/5 space-y-4">
          <div className="gl-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">マンUくん</h1>
              <p className="text-xs text-green-500 font-medium">オンライン</p>
            </div>
          </div>

          <div className="gl-card">
            <p className="text-text-secondary text-sm leading-relaxed">
              Manchester United を愛するAIキャラクター。レッドデビルズの歴史から最新の試合まで、何でも聞いてくれよな〜🔴⚪⚽
            </p>
          </div>

          <div className="gl-card">
            <h2 className="text-sm font-bold text-text-primary mb-3">レジェンド選手</h2>
            <ul className="space-y-2">
              {legends.map((l) => (
                <li key={l.name} className="flex justify-between items-center text-sm">
                  <span className="text-text-primary font-medium">{l.name}</span>
                  <span className="text-text-muted text-xs">{l.era}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="gl-card">
            <h2 className="text-sm font-bold text-text-primary mb-3">こんな質問できるよ</h2>
            <div className="flex flex-col gap-2">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-border text-text-secondary hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 右カラム: チャット (60%) */}
        <div className="w-full md:w-3/5 gl-card flex flex-col h-[60vh] md:h-[calc(100vh-12rem)]">
          {/* メッセージリスト */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-2 shrink-0 self-end mb-1">
                    M
                  </div>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-xs md:max-w-sm text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-sm'
                      : 'bg-background-muted text-text-primary border border-border rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-2 shrink-0">
                  M
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-background-muted border border-border">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* クイックサジェスト */}
          <div className="pt-3 flex gap-2 overflow-x-auto shrink-0">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-red-500 hover:text-red-500 transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>

          {/* 入力欄 */}
          <div className="pt-3 border-t border-border mt-3 shrink-0">
            <div className="flex items-center gap-2 bg-background-muted rounded-full border border-border px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
                placeholder="マンUくんに質問する..."
                className="flex-1 bg-transparent text-text-primary text-sm focus:outline-none placeholder:text-text-muted"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-red-700 transition-colors shrink-0"
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
