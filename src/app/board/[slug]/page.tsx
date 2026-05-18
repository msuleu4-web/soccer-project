'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, PenSquare } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PostCard from '@/app/components/board/PostCard'
import FollowButton from '@/app/components/board/FollowButton'
import type { Team, PostSummary, PostsResponse, TeamsResponse } from '@/types/board'

type Tab = 'latest' | 'popular'

export default function TeamBoardPage() {
  const { slug } = useParams<{ slug: string }>()

  const [team, setTeam]       = useState<Team | null>(null)
  const [posts, setPosts]     = useState<PostSummary[]>([])
  const [total, setTotal]     = useState(0)
  const [tab, setTab]         = useState<Tab>('latest')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setIsAdmin(d.isAdmin)).catch(() => {})
  }, [])

  // チーム情報取得
  useEffect(() => {
    fetch('/api/board/teams')
      .then(r => r.json())
      .then((data: TeamsResponse) => {
        const found = data.teams?.find(t => t.slug === slug) ?? null
        setTeam(found)
      })
      .catch(() => {})
  }, [slug])

  // 投稿一覧取得
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/board/teams/${slug}/posts?tab=${tab}`)
      .then(r => r.json())
      .then((data: PostsResponse) => {
        setPosts(data.posts ?? [])
        setTotal(data.total ?? 0)
      })
      .catch(() => setError('投稿の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [slug, tab])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Header />

      <div className="mt-8 mb-6">
        <Link href="/board" className="inline-flex items-center gap-1 text-sm text-[var(--fg-muted)] hover:text-[var(--color-accent-green)] transition-colors mb-4">
          <ArrowLeft size={14} />
          掲示板トップ
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--fg-1)]">
              {team?.name ?? slug}
            </h1>
            {team && (
              <span className="text-xs text-[var(--fg-muted)] bg-[var(--bg-surface-elevated)] px-2 py-1 rounded-full">
                {team.league}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {team && <FollowButton slug={slug} teamName={team.name} />}
            <Link href={`/board/${slug}/new`} className="gl-btn gl-btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
              <PenSquare size={14} />
              投稿する
            </Link>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b border-[var(--border-default)] mb-4">
        {(['latest', 'popular'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 px-4 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-[var(--fg-1)] border-b-2 border-[var(--color-accent-green)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-1)]'
            }`}
          >
            {t === 'latest' ? '最新' : '🔥 人気'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="gl-card h-20 animate-pulse" />
          ))}
        </div>
      )}
      {error && <p className="text-[var(--color-danger)]">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <div className="gl-card text-center py-12">
          <p className="text-[var(--fg-muted)] mb-4">まだ投稿がありません</p>
          <Link href={`/board/${slug}/new`} className="gl-btn gl-btn-primary text-sm px-4 py-2">
            最初の投稿をする
          </Link>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="space-y-2">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                slug={slug}
                isAdmin={isAdmin}
                onDeleted={id => setPosts(prev => prev.filter(p => p.id !== id))}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--fg-muted)] text-right mt-3">{total} 件</p>
        </>
      )}

      <Footer />
    </div>
  )
}
