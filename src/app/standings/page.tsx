
"use client";

import { useState, useEffect, Suspense } from 'react';
import type { Standing } from '@/types/football';
import Image from 'next/image';
import { Trophy } from 'lucide-react';

function StandingsTable() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [season, setSeason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStandings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/standings`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch standings");
        }
        setStandings(data.standings);
        setSeason(data.season);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
    loadStandings();
  }, []);

  const getRowClass = (rank: number, total: number) => {
    if (rank <= 3) return 'bg-green-100/50 dark:bg-green-900/30';
    if (rank > total - 3) return 'bg-red-100/50 dark:bg-red-900/30';
    return 'bg-card';
  };

  if (loading) return <div className="mt-6 w-full h-96 bg-card border border-border rounded-lg animate-pulse"></div>;
  if (error) return <div className="text-red-500 text-center mt-6">{error}</div>;
  if (standings.length === 0) return <div className="text-center text-text-secondary mt-6">順位表データが見つかりません。</div>;

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full divide-y divide-border bg-card-bg rounded-lg shadow-md">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-2 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">順位</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">クラブ</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">試合</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">勝</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">分</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">敗</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">得点</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">失点</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">得失</th>
            <th className="px-2 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">勝点</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {standings.map(s => (
            <tr key={s.teamId} className={getRowClass(s.rank, standings.length)}>
              <td className="px-2 py-3 text-center font-medium">{s.rank}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-medium text-sm">{s.team}</span>
              </td>

              <td className="px-2 py-3 text-center text-sm">{s.played}</td>
              <td className="px-2 py-3 text-center text-sm">{s.win}</td>
              <td className="px-2 py-3 text-center text-sm">{s.draw}</td>
              <td className="px-2 py-3 text-center text-sm">{s.lose}</td>
              <td className="px-2 py-3 text-center text-sm hidden sm:table-cell">{s.goalsFor}</td>
              <td className="px-2 py-3 text-center text-sm hidden sm:table-cell">{s.goalsAgainst}</td>
              <td className="px-2 py-3 text-center text-sm">{s.goalDiff}</td>
              <td className="px-2 py-3 text-center font-bold text-base">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StandingsPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-center mb-4">
        <Trophy className="w-6 h-6 mr-2 text-yellow-500"/>
        <h1 className="text-2xl md:text-3xl font-bold">プレミアリーグ 順位表</h1>
      </div>
      <p className="text-center text-gray-500 text-sm mb-8">2025-2026シーズン</p>
      <Suspense fallback={<div>Loading...</div>}>
        <StandingsTable />
      </Suspense>
    </div>
  );
}
