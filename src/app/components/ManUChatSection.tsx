
'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const suggestionPrompts = [
  "カントナについて",
  "今シーズンの成績は？",
  "次の試合いつ？",
];

export default function ManUChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'よっ！マンUくんだぜ！🔴⚪ 何でも聞いてくれよな〜' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    if (input) setInput(''); // clear input only if it was used
    setLoading(true);

    try {
      const response = await fetch('/api/chat/manu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('API response error');
      }

      const data = await response.json();
      setMessages([...newMessages, data]);

    } catch (error) {
      console.error('Error fetching from chat API:', error);
      const errorMessage: Message = { role: 'model', content: 'Sorry, something went wrong.' };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gl-card">
      <h2 className="text-xl font-bold text-text-primary mb-2">マンUくんに聞いてみよう 🔴⚪</h2>
      <p className="text-text-secondary mb-4">マンU について何でも質問してください</p>

      <div className="h-96 bg-background-muted rounded-lg flex flex-col p-4">
        <div className="flex-1 overflow-y-auto pr-2">
          {
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          }
          {loading && <div className="flex justify-start mb-3"><div className="p-3 rounded-lg bg-gray-700"><p className='text-sm text-white'>...</p></div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {suggestionPrompts.map(prompt => (
             <button 
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap hover:bg-gray-600"
             >
              {prompt}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-border-muted mt-2">
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
              className="w-full bg-input-background text-text-primary p-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
              placeholder="メッセージを入力..."
            />
            <button onClick={() => handleSendMessage(input)} className="bg-accent-green text-white px-4 rounded-r-lg">送信</button>
          </div>
        </div>
      </div>
    </div>
  );
}
