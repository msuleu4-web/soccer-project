'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getAnonId } from '@/lib/board/anonId'
import type { Team, TeamsResponse } from '@/types/board'

export default function NewPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const router   = useRouter()

  const [team, setTeam]           = useState<Team | null>(null)
  const [teamError, setTeamError] = useState(false)
  const [title, setTitle]         = useState('')
  const [content, setContent]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/board/teams')
      .then(r => r.json())
      .then((data: TeamsResponse) => {
        const found = data.teams?.find(t => t.slug === slug) ?? null
        setTeam(found)
        if (!found) setTeamError(true)
      })
      .catch(() => setTeamError(true))
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!team || !title.trim() || !content.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/board/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: team.id,
          title:   title.trim(),
          content: content.trim(),
          anon_id: getAnonId(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '投稿に失敗しました')
        return
      }
      router.push(`/board/${slug}/${data.post.id}`)
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

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

      <div className="gl-card">
        <h1 className="text-xl font-bold text-[var(--fg-1)] mb-1">新規投稿</h1>
        {team && (
          <p className="text-sm text-[var(--fg-muted)] mb-6">{team.name}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--fg-2)] mb-1">
              タイトル <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="タイトルを入力 (最大200文字)"
              maxLength={200}
              required
              className="gl-input"
            />
            <p className="text-xs text-[var(--fg-muted)] mt-1 text-right">{title.length} / 200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg-2)] mb-1">
              本文 <span className="text-[var(--color-danger)]">*</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="本文を入力 (最大10000文字)"
              maxLength={10000}
              rows={8}
              required
              className="gl-input resize-none"
            />
            <p className="text-xs text-[var(--fg-muted)] mt-1 text-right">{content.length} / 10000</p>
          </div>

          {teamError && (
            <p className="text-sm text-[var(--color-danger)]">
              チーム情報を取得できませんでした。ページを再読み込みしてください。
            </p>
          )}
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[var(--fg-muted)]">投稿者は「匿名」として表示されます</p>
            <div className="flex gap-3">
              <Link href={`/board/${slug}`} className="gl-btn gl-btn-secondary text-sm px-4 py-2">
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading || !team || !title.trim() || !content.trim()}
                className="gl-btn gl-btn-primary text-sm px-6 py-2"
              >
                {loading ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
