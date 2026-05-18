'use client'

import { useState } from 'react'
import { getAnonId } from '@/lib/board/anonId'

interface Props {
  postId: string
  onPosted: (commentId: string) => void
}

export default function CommentForm({ postId, onPosted }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/board/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), anon_id: getAnonId() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'コメントの投稿に失敗しました')
        return
      }
      setContent('')
      onPosted(data.comment.id)
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="コメントを入力... (最大2000文字)"
        maxLength={2000}
        rows={3}
        className="gl-input resize-none"
      />
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[var(--fg-muted)]">{content.length} / 2000</span>
        <button
          type="submit"
          disabled={loading || content.trim().length === 0}
          className="gl-btn gl-btn-primary text-sm px-4 py-2"
        >
          {loading ? '送信中...' : 'コメントする'}
        </button>
      </div>
    </form>
  )
}
