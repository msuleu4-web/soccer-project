
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const suggestionPrompts = [
  'カントナについて',
  '今シーズンの成績は？',
  '次の試合いつ？',
];

export default function ManUChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'よっ！マンUくんだぜ！🔴⚪ 何でも聞いてくれよな〜' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/manu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      setMessages([...newMessages, data]);
    } catch {
      setMessages([...newMessages, { role: 'model', content: 'ごめん、ちょっとエラーが出ちゃったぜ…もう一回試してみてくれ！' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gl-card">
      <h2 className="text-xl font-bold text-text-primary mb-2">マンUくんに聞いてみよう 🔴⚪</h2>
      <p className="text-text-secondary mb-4">Manchester United について何でも質問してください</p>

      <div className="h-96 bg-background-muted rounded-lg flex flex-col p-4">
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs mr-2 shrink-0 self-end mb-1">
                  M
                </div>
              )}
              <div
                className={`px-3 py-2 rounded-2xl max-w-xs text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-sm'
                    : 'bg-background text-text-primary border border-border rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs mr-2 shrink-0">
                M
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-background border border-border">
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

        <div className="mt-3 flex gap-2 overflow-x-auto shrink-0">
          {suggestionPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-full border border-border text-text-secondary hover:border-red-500 hover:text-red-500 transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-border mt-3 shrink-0">
          <div className="flex items-center gap-2 bg-background rounded-full border border-border px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(input)}
              placeholder="マンUくんに質問する..."
              className="flex-1 bg-transparent text-text-primary text-sm focus:outline-none placeholder:text-text-muted"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-red-700 transition-colors shrink-0"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
