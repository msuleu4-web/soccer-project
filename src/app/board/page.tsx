'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import FollowButton from '@/app/components/board/FollowButton'
import { getFollowedTeams } from '@/lib/board/anonId'
import type { Team, TeamsResponse } from '@/types/board'

export default function BoardTopPage() {
  const [teams, setTeams]                 = useState<Team[]>([])
  const [followedSlugs, setFollowedSlugs] = useState<string[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => {
    setFollowedSlugs(getFollowedTeams())
    fetch('/api/board/teams')
      .then(r => r.json())
      .then((data: TeamsResponse) => setTeams(data.teams ?? []))
      .catch(() => setError('チーム一覧の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [])

  const followedTeams = teams.filter(t => followedSlugs.includes(t.slug))
  const grouped = teams.reduce<Record<string, Team[]>>((acc, t) => {
    ;(acc[t.league] ??= []).push(t)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Header />

      <div className="mt-8 mb-6 flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-[var(--color-accent-green)]" />
        <h1 className="text-2xl font-bold text-[var(--fg-1)]">チーム掲示板</h1>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="gl-card h-16 animate-pulse" />
          ))}
        </div>
      )}
      {error && <p className="text-[var(--color-danger)]">{error}</p>}

      {!loading && !error && (
        <>
          {/* フォロー中チーム */}
          {followedTeams.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
                フォロー中
              </h2>
              <div className="space-y-2">
                {followedTeams.map(team => (
                  <TeamRow key={team.id} team={team} />
                ))}
              </div>
            </section>
          )}

          {/* リーグ別全チーム */}
          {Object.entries(grouped).map(([league, leagueTeams]) => (
            <section key={league} className="mb-8">
              <h2 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
                {league}
              </h2>
              <div className="space-y-2">
                {leagueTeams.map(team => (
                  <TeamRow key={team.id} team={team} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <Footer />
    </div>
  )
}

function TeamRow({ team }: { team: Team }) {
  return (
    <div className="gl-card py-3 px-5 flex items-center justify-between">
      <Link
        href={`/board/${team.slug}`}
        className="font-semibold text-[var(--fg-1)] hover:text-[var(--color-accent-green)] transition-colors"
      >
        {team.name}
      </Link>
      <FollowButton slug={team.slug} teamName={team.name} />
    </div>
  )
}
