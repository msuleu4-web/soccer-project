'use client';

import { useState } from 'react';

export default function ShareButtons({ simId, title }: { simId: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/simulator/${simId}` : '';

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${title}\n#GoalLabo #監督AIシミュレーター`
  )}&url=${encodeURIComponent(url)}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      fetch(`/api/simulator/${simId}/share`, { method: 'POST' }).catch(() => {});
    });
  }

  return (
    <div className="gl-card p-5 flex flex-wrap gap-3 justify-center">
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="gl-btn gl-btn-primary"
      >
        𝕏 でシェア
      </a>
      <button onClick={copyLink} className="gl-btn gl-btn-secondary">
        {copied ? 'コピーしました' : 'リンクをコピー'}
      </button>
    </div>
  );
}
