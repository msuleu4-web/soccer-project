'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { getAnonId } from '@/lib/board/anonId'

interface Props {
  postId: string
  initialLikes: number
  initialDislikes: number
  initialVoteType?: 'like' | 'dislike' | null
}

export default function VoteButtons({ postId, initialLikes, initialDislikes, initialVoteType = null }: Props) {
  const [likes, setLikes]       = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [voteType, setVoteType] = useState<'like' | 'dislike' | null>(initialVoteType)
  const [loading, setLoading]   = useState(false)

  const handleVote = async (type: 'like' | 'dislike') => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/board/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: type, anon_id: getAnonId() }),
      })
      if (!res.ok) return
      const data = await res.json()
      setLikes(data.likes)
      setDislikes(data.dislikes)
      setVoteType(data.vote_type)
    } catch {
      // ネットワークエラーは無視
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote('like')}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all
          ${voteType === 'like'
            ? 'bg-[rgba(0,210,106,0.15)] border-[var(--color-accent-green)] text-[var(--color-accent-green)]'
            : 'border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--color-accent-green)] hover:text-[var(--color-accent-green)]'
          }`}
      >
        <ThumbsUp size={14} />
        <span>{likes}</span>
      </button>
      <button
        onClick={() => handleVote('dislike')}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all
          ${voteType === 'dislike'
            ? 'bg-[rgba(230,57,70,0.15)] border-[var(--color-danger)] text-[var(--color-danger)]'
            : 'border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]'
          }`}
      >
        <ThumbsDown size={14} />
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
