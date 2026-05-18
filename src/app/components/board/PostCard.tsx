'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import type { PostSummary } from '@/types/board'

interface Props {
  post: PostSummary
  slug: string
  isAdmin?: boolean
  onDeleted?: (id: string) => void
}

export default function PostCard({ post, slug, isAdmin, onDeleted }: Props) {
  const date = new Date(post.created_at).toLocaleDateString('ja-JP', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('この投稿を削除しますか？')) return
    const res = await fetch(`/api/board/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDeleted?.(post.id)
    } else {
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="relative">
      <Link href={`/board/${slug}/${post.id}`} className="block">
        <div className="gl-card py-4 px-5">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {post.is_popular && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[rgba(0,210,106,0.15)] text-[var(--color-accent-green)]">
                    🔥 人気
                  </span>
                )}
              </div>
              <p className="font-semibold text-[var(--fg-1)] truncate pr-8">{post.title}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[var(--fg-muted)]">
                <span>匿名</span>
                <span>{date}</span>
                <span>👍 {post.likes}</span>
                <span>💬 {post.comment_count}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 rounded text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="削除"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
