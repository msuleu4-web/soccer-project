'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import VoteButtons from '@/app/components/board/VoteButtons'
import CommentForm from '@/app/components/board/CommentForm'
import type { PostDetail, BoardComment, PostDetailResponse } from '@/types/board'

export default function PostDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const router = useRouter()

  const [post, setPost]         = useState<PostDetail | null>(null)
  const [comments, setComments] = useState<BoardComment[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [isAdmin, setIsAdmin]   = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setIsAdmin(d.isAdmin)).catch(() => {})
  }, [])

  useEffect(() => {
    fetch(`/api/board/posts/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((data: PostDetailResponse) => {
        setPost(data.post)
        setComments(data.comments ?? [])
      })
      .catch(() => setError('投稿の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [id])

  const handleCommentPosted = (_commentId: string) => {
    fetch(`/api/board/posts/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((data: PostDetailResponse) => {
        setComments(data.comments ?? [])
        if (data.post) setPost(data.post)
      })
      .catch(() => {})
  }

  const handleDeletePost = async () => {
    if (!confirm('この投稿を削除しますか？')) return
    const res = await fetch(`/api/board/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push(`/board/${slug}`)
    } else {
      alert('削除に失敗しました')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？')) return
    const res = await fetch(`/api/board/posts/${id}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== commentId))
    } else {
      alert('削除に失敗しました')
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Header />

      <div className="mt-8 mb-6">
        <Link
          href={`/board/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--fg-muted)] hover:text-[var(--color-accent-green)] transition-colors"
        >
          <ArrowLeft size={14} />
          掲示板に戻る
        </Link>
      </div>

      {loading && <div className="gl-card h-48 animate-pulse" />}
      {error && <p className="text-[var(--color-danger)]">{error}</p>}

      {!loading && !error && !post && (
        <p className="text-[var(--fg-muted)]">投稿が見つかりません。</p>
      )}

      {post && (
        <>
          {/* 投稿本文 */}
          <div className="gl-card mb-6">
            <div className="flex items-center gap-2 mb-3">
              {post.is_popular && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[rgba(0,210,106,0.15)] text-[var(--color-accent-green)]">
                  🔥 人気
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[var(--fg-1)] mb-4">{post.title}</h1>
            <p className="text-sm text-[var(--fg-2)] whitespace-pre-wrap leading-relaxed mb-6">
              {post.content}
            </p>
            <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-4">
              <div className="text-xs text-[var(--fg-muted)]">
                <span>匿名</span>
                <span className="mx-2">·</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                    投稿を削除
                  </button>
                )}
                <VoteButtons
                  postId={post.id}
                  initialLikes={post.likes}
                  initialDislikes={post.dislikes}
                />
              </div>
            </div>
          </div>

          {/* コメント一覧 */}
          <div className="gl-card">
            <h2 className="text-base font-bold text-[var(--fg-1)] mb-4">
              コメント ({comments.length})
            </h2>

            {comments.length === 0 && (
              <p className="text-sm text-[var(--fg-muted)] mb-4">
                まだコメントはありません。最初のコメントをどうぞ。
              </p>
            )}

            <div className="space-y-4 mb-6">
              {comments.map((c, idx) => (
                <div key={c.id} className="flex gap-3 group">
                  <span className="text-xs text-[var(--fg-muted)] w-6 shrink-0 pt-0.5 text-right">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-[var(--fg-muted)]">
                        匿名 · {formatDate(c.created_at)}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                          title="削除"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-[var(--fg-2)] whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border-default)] pt-4">
              <CommentForm postId={post.id} onPosted={handleCommentPosted} />
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
