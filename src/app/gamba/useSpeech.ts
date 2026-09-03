'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* Web Speech API はまだ TypeScript の標準ライブラリに入っていないので最小限だけ定義する。 */
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * 関西弁・選手名・チーム名は誤認識されやすい。
 * Web Speech API にはカスタム語彙を渡せないので、認識結果を後段で補正する。
 */
const VOCAB_FIXES: [RegExp, string][] = [
  [/頑張大阪|がんば大阪|ガンバ大坂/g, 'ガンバ大阪'],
  [/パナソニックスタジアム(すいた|水田|吹田)/g, 'パナソニックスタジアム吹田'],
  [/パナすた|花スタ|パナ須田/g, 'パナスタ'],
  [/宇佐見|うさみ|ウサミ/g, '宇佐美'],
  [/せれっそ|セレッソ大坂/g, 'セレッソ'],
  [/大阪だーびー|大阪ダービ/g, '大阪ダービー'],
  [/j ?リーグ|ジェイリーグ|ジェーリーグ/gi, 'Jリーグ'],
  [/ゴールうら|ゴール裏側/g, 'ゴール裏'],
  [/エーシーエル|えーしーえる/g, 'ACL'],
  [/あおくろ|青黒色/g, '青黒'],
];

export function correctVocabulary(text: string): string {
  return VOCAB_FIXES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text).trim();
}

/** 読み上げやすい形に整える。表示テキストではなく TTS に渡す直前だけに使う。 */
export function toSpokenForm(text: string): string {
  return text
    .replace(/(\d{4})[/年](\d{1,2})[/月](\d{1,2})日?/g, '$2月$3日')
    .replace(/(\d{1,2})\/(\d{1,2})/g, '$1月$2日')
    .replace(/(\d)\s*[-–—ー~〜]\s*(\d)/g, '$1対$2')
    .replace(/\bGK\b/g, 'ゴールキーパー')
    .replace(/\bDF\b/g, 'ディフェンダー')
    .replace(/\bMF\b/g, 'ミッドフィルダー')
    .replace(/\bFW\b/g, 'フォワード')
    .replace(/\bACL\b/g, 'エーシーエル')
    .replace(/\bJ1\b/g, 'ジェイワン')
    .replace(/\bJ2\b/g, 'ジェイツー')
    .replace(/\bJリーグ\b/g, 'ジェイリーグ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface UseSpeechRecognitionOptions {
  onFinalResult: (transcript: string) => void;
  /** マイクを開いたのに一言も拾えずに終わったときに呼ばれる。 */
  onSilence?: () => void;
}

export function useSpeechRecognition({ onFinalResult, onSilence }: UseSpeechRecognitionOptions) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;
  const onSilenceRef = useRef(onSilence);
  onSilenceRef.current = onSilence;
  // start() から onend() までの間に、何か一つでも音声を拾えたか。
  const heardAnythingRef = useRef(false);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      heardAnythingRef.current = true;
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) final += text;
        else interim += text;
      }
      setInterimText(interim);
      if (final) {
        setInterimText('');
        onFinalResultRef.current(correctVocabulary(final));
      }
    };

    recognition.onerror = (event) => {
      console.error('SpeechRecognition error:', event.error);
      // 無音で終わるのは通常動作なのでエラー表示しない。
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setError(
        event.error === 'not-allowed'
          ? 'マイクの使用が許可されてへんみたいや。ブラウザの設定を確認してな。'
          : `音声認識でエラーが出たわ（${event.error}）。もっかい試してみて。`,
      );
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText('');
      if (!heardAnythingRef.current) onSilenceRef.current?.();
    };

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setError(null);
    heardAnythingRef.current = false;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // すでに開始済みのときは start() が例外を投げる。状態を合わせるだけでよい。
      setListening(true);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, interimText, error, start, stop };
}

/**
 * マイクに実際に音が届いているかを可視化するための音量メーター。
 * SpeechRecognition のエラーコードだけでは「マイクが無音」なのか
 * 「認識エンジンが拾えていない」のか区別できないので、getUserMedia で直接見る。
 */
export function useMicLevel(active: boolean) {
  const [level, setLevel] = useState(0);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setLevel(0);
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let rafId: number | null = null;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const AudioContextCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextCtor();
        const source = audioCtx.createMediaStreamSource(s);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sumSquares = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sumSquares += v * v;
          }
          const rms = Math.sqrt(sumSquares / data.length);
          setLevel(Math.min(1, rms * 4));
          rafId = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('getUserMedia error:', err);
        const name = err instanceof DOMException ? err.name : '';
        const messages: Record<string, string> = {
          NotAllowedError: 'マイクの許可がブロックされてるわ。ブラウザのアドレスバーの鍵マークから許可してくれるか。',
          NotFoundError: 'マイクが見つからへん。パソコンにマイクが繋がってるか確認してや。',
          NotReadableError: '他のアプリがマイクを使ってて掴めへんみたいや。他のビデオ通話とか閉じてみて。',
        };
        setDeviceError(messages[name] ?? 'マイクにアクセスできへんかったわ。');
      });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      audioCtx?.close().catch(() => {});
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  return { level, deviceError };
}

export function useSpeechSynthesis() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // サポートはしているが、日本語ボイスが1つも入っていない環境かどうか。
  const [japaneseVoiceCount, setJapaneseVoiceCount] = useState<number | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const pendingRef = useRef(0);
  // Chrome には、他に参照を持たない SpeechSynthesisUtterance を発話完了前に
  // GC してしまい、無音のまま終わる既知バグがある。Set で参照を保持して防ぐ。
  // https://bugs.chromium.org/p/chromium/issues/detail?id=509488
  const utterancesRef = useRef<Set<SpeechSynthesisUtterance>>(new Set());
  // 同じく Chrome には、発話が続くと十数秒でキューが止まってしまうバグがある。
  // 定期的に pause/resume することで回避する。
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const japanese = voices.filter((v) => v.lang.toLowerCase().startsWith('ja'));
      // 男性寄りの声を優先。無ければ最初の日本語ボイスで妥協する。
      voiceRef.current =
        japanese.find((v) => /male|otoya|ichiro|hattori|daichi/i.test(v.name)) ?? japanese[0] ?? null;
      setJapaneseVoiceCount(japanese.length);
    };

    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    };
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const spoken = toSpokenForm(text);
      if (!spoken) return;

      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.lang = 'ja-JP';
      if (voiceRef.current) utterance.voice = voiceRef.current;
      // 熱量を出すため標準よりやや速め・やや高め。
      utterance.rate = 1.1;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterancesRef.current.add(utterance);
      pendingRef.current += 1;
      setSpeaking(true);

      if (!keepAliveRef.current) {
        keepAliveRef.current = setInterval(() => {
          if (!window.speechSynthesis.speaking) return;
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }, 5000);
      }

      const done = () => {
        utterancesRef.current.delete(utterance);
        pendingRef.current = Math.max(0, pendingRef.current - 1);
        if (pendingRef.current === 0) {
          setSpeaking(false);
          stopKeepAlive();
        }
      };
      utterance.onend = done;
      utterance.onerror = (event) => {
        console.error('SpeechSynthesis error:', event.error);
        done();
      };

      window.speechSynthesis.speak(utterance);
    },
    [stopKeepAlive],
  );

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    utterancesRef.current.clear();
    pendingRef.current = 0;
    setSpeaking(false);
    stopKeepAlive();
  }, [stopKeepAlive]);

  return { supported, speaking, speak, cancel, japaneseVoiceCount };
}
