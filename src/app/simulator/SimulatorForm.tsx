'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAnonId } from '@/lib/board/anonId';
import FormationPitch from './components/FormationPitch';
import { FORMATIONS, STYLES, type Formation, type TacticalStyle } from '@/types/simulator';
import type { Team } from '@/types/board';

interface Props {
  teams: Team[];
}

export default function SimulatorForm({ teams }: Props) {
  const router = useRouter();
  const [homeTeamId, setHomeTeamId] = useState<string | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<string | null>(null);
  const [homeFormation, setHomeFormation] = useState<Formation>('4-3-3');
  const [awayFormation, setAwayFormation] = useState<Formation>('4-3-3');
  const [homeStyle, setHomeStyle] = useState<TacticalStyle>('balanced');
  const [awayStyle, setAwayStyle] = useState<TacticalStyle>('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homeTeam = teams.find((t) => t.id === homeTeamId);
  const awayTeam = teams.find((t) => t.id === awayTeamId);

  const canKickoff = homeTeamId && awayTeamId && homeTeamId !== awayTeamId && !loading;

  async function kickoff() {
    if (!canKickoff) return;
    setLoading(true);
    setError(null);
    try {
      const anonId = getAnonId();
      const res = await fetch('/api/simulator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          home_formation: homeFormation,
          away_formation: awayFormation,
          home_style: homeStyle,
          away_style: awayStyle,
          anon_id: anonId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '生成失敗');
      router.push(`/simulator/${json.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成に失敗しました');
      setLoading(false);
    }
  }

  const plTeams = teams.filter((t) => t.league === 'Premier League');
  const j1Teams = teams.filter((t) => t.league === 'J1リーグ');
  const otherTeams = teams.filter((t) => t.league !== 'Premier League' && t.league !== 'J1リーグ');

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <TeamSelector
          label="ホームチーム"
          plTeams={plTeams.filter((t) => t.id !== awayTeamId)}
          j1Teams={j1Teams.filter((t) => t.id !== awayTeamId)}
          otherTeams={otherTeams.filter((t) => t.id !== awayTeamId)}
          value={homeTeamId}
          onChange={setHomeTeamId}
          team={homeTeam}
          formation={homeFormation}
          onFormationChange={setHomeFormation}
          style={homeStyle}
          onStyleChange={setHomeStyle}
        />
        <TeamSelector
          label="アウェイチーム"
          plTeams={plTeams.filter((t) => t.id !== homeTeamId)}
          j1Teams={j1Teams.filter((t) => t.id !== homeTeamId)}
          otherTeams={otherTeams.filter((t) => t.id !== homeTeamId)}
          value={awayTeamId}
          onChange={setAwayTeamId}
          team={awayTeam}
          formation={awayFormation}
          onFormationChange={setAwayFormation}
          style={awayStyle}
          onStyleChange={setAwayStyle}
        />
      </div>

      {error && (
        <div className="gl-card p-4 border-red-500 text-red-500">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={kickoff}
          disabled={!canKickoff}
          className="gl-btn gl-btn-primary text-xl px-12 py-4"
        >
          {loading ? '試合生成中...' : 'キックオフ!'}
        </button>
      </div>

      {loading && (
        <p className="text-center text-[var(--fg-muted)] text-sm">
          AIが90分間の試合を組み立てています (10〜20秒ほどかかります)
        </p>
      )}
    </div>
  );
}

interface TeamSelectorProps {
  label: string;
  plTeams: Team[];
  j1Teams: Team[];
  otherTeams: Team[];
  value: string | null;
  onChange: (id: string | null) => void;
  team: Team | undefined;
  formation: Formation;
  onFormationChange: (f: Formation) => void;
  style: TacticalStyle;
  onStyleChange: (s: TacticalStyle) => void;
}

function TeamSelector(props: TeamSelectorProps) {
  return (
    <div className="gl-card p-5 space-y-4">
      <h2 className="text-lg font-bold">{props.label}</h2>
      <select
        className="gl-input w-full"
        value={props.value ?? ''}
        onChange={(e) => props.onChange(e.target.value || null)}
      >
        <option value="">-- チームを選択 --</option>
        {props.plTeams.length > 0 && (
          <optgroup label="Premier League">
            {props.plTeams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </optgroup>
        )}
        {props.j1Teams.length > 0 && (
          <optgroup label="J1リーグ">
            {props.j1Teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </optgroup>
        )}
        {props.otherTeams.length > 0 && (
          <optgroup label="その他">
            {props.otherTeams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </optgroup>
        )}
      </select>

      {props.team && (
        <>
          <div className="aspect-[2/3] rounded-lg overflow-hidden">
            <FormationPitch formation={props.formation} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">フォーメーション</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => props.onFormationChange(f)}
                  className={`gl-btn text-sm py-2 ${
                    props.formation === f ? 'gl-btn-primary' : 'gl-btn-secondary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">監督スタイル</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => props.onStyleChange(s.value)}
                  className={`gl-btn text-sm py-2 ${
                    props.style === s.value ? 'gl-btn-accent' : 'gl-btn-secondary'
                  }`}
                  title={s.description}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
