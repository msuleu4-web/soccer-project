'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { isFollowingTeam, toggleFollowTeam } from '@/lib/board/anonId'

interface Props {
  slug: string
  teamName: string
}

export default function FollowButton({ slug, teamName }: Props) {
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    setFollowing(isFollowingTeam(slug))
  }, [slug])

  const handleToggle = () => {
    const next = toggleFollowTeam(slug)
    setFollowing(next)
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all
        ${following
          ? 'bg-[rgba(0,210,106,0.15)] border-[var(--color-accent-green)] text-[var(--color-accent-green)]'
          : 'border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--color-accent-green)] hover:text-[var(--color-accent-green)]'
        }`}
      aria-label={following ? `${teamName}のフォローを解除` : `${teamName}をフォロー`}
    >
      <Star size={14} fill={following ? 'currentColor' : 'none'} />
      <span>{following ? 'フォロー中' : 'フォロー'}</span>
    </button>
  )
}
