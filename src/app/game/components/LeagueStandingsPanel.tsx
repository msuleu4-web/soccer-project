'use client';

import { useState } from 'react';
import type { GameState } from '../types/game';
import { LEAGUES, TEAMS } from '../lib/leagueData';
import { getPlayerRank } from '../lib/standingsEngine';

interface Props {
  state: GameState;
}

// チームの特徴テキスト
function getTeamStyle(teamId: string): string {
  const styles: Record<string, string> = {
    // 地域
    aomori_sol: '守備重視の堅実なチーム',
    iwate_frt:  'フィジカル勝負の北国スタイル',
    akita_nth:  '組織力で戦う規律型',
    yamagata_rv:'カウンター主体のスタイル',
    tottori_win:'若手育成に定評あり',
    shimane_ath:'地域密着の応援型クラブ',
    kochi_pio:  '攻撃的なサッカーを志向',
    // J3
    toyama_van: '堅守速攻スタイル',
    ishikawa_swn:'テクニカルなパスサッカー',
    fukui_em:   '組織的な守備ブロック',
    miyazaki_sun:'南九州の太陽族、攻撃的',
    oita_grn:   '個人技を活かすスタイル',
    saga_utd:   '中盤支配型チーム',
    nagasaki_bay:'港町の闘志、泥臭いサッカー',
    yamaguchi_wv:'波のような流動的なポゼッション',
    // J2
    niigata_alb: '雪国仕込みのタフな守備',
    nagano_alp:  '高地鍛錬の抜群スタミナ',
    shizuoka_fz: 'サッカー王国の攻撃哲学',
    okayama_brv: '勇敢な縦への速い攻撃',
    kumamoto_vlc:'火山の如き激しいプレス',
    mie_tidal:   '潮のような変幻自在の戦術',
    gunma_hawks: '鷹のような鋭いカウンター',
    tochigi_sc:  '空をイメージした自由なサッカー',
    tokushima_vs:'渦潮のような旋回パス',
    // J1
    tokyo_vic:   '首都クラブ。豊富な資金力と国際経験',
    osaka_grd:   '関西最強。闘志あふれる攻撃サッカー',
    nagoya_phx:  '中部の雄。守備的カウンタースタイル',
    yokohama_mb: 'みなとみらいの洗練されたポゼッション',
    sapporo_pol: '北の大地のフィジカルサッカー',
    fukuoka_wng: '九州最大クラブ。縦に速いサッカー',
    hiroshima_lg:'伝説的な守備組織を持つ強豪',
    sendai_rl:   '東北を代表する王族クラブ',
    saitama_tgr: 'タイガーの如き圧倒的なプレス',
    kyoto_imp:   '千年の都、洗練されたテクニック',
    kobe_azu:    '六甲の海風を受ける攻撃的クラブ',
    chiba_sea:   '海をイメージしたダイナミックな展開',
    // ブンデス
    berlin_sturm:   '首都の嵐、ドイツ最大の熱狂クラブ',
    munich_rotw:    '伝統の赤と白、ブンデス最強クラブ',
    hamburg_hafe:   '港町の誇り、堅守のブロック戦術',
    dortmund_blk:   '黒と黄の旋風、ゲーゲンプレス',
    frankfurt_adr:  '鷲のように舞う縦に速いサッカー',
    koeln_dom:      '大聖堂の街、組織的ポゼッション',
    stuttgart_ros:  '薔薇のように美しいパスサッカー',
    leipzig_bull:   '高強度プレスとデータ重視の現代型',
    // プレミア/ラリーガ
    london_royals:  '王室クラブ。欧州屈指のスター軍団',
    manchester_stm: '嵐のプレス、プレミア最高峰の強度',
    madrid_blanco:  '白の貴族。世界最高峰のタレント集団',
    barcelona_azgr: 'バルサ哲学。ボール支配率世界一',
    liverpool_red:  '赤の軍団。最もエネルギッシュなゲーゲンプレス',
    sevilla_sol:    '太陽の街の情熱サッカー',
    chelsea_blue:   '青い軍団。戦術的な完成度',
    atletico_rj:    '赤と白の闘将スタイル、欧州屈指の守備',
  };
  return styles[teamId] ?? 'バランスの取れたチーム';
}

export default function LeagueStandingsPanel({ state }: Props) {
  const [showAll, setShowAll] = useState(false);
  const standings = state.leagueStandings;
  const playerRank = getPlayerRank(standings, state.currentTeam.id);
  const league = LEAGUES[state.currentLeague];
  const totalTeams = standings.length;

  const displayCount = showAll ? totalTeams : Math.min(8, totalTeams);
  const visibleStandings = standings.slice(0, displayCount);

  // 表示するチームに選手チームが含まれているか確認
  const playerVisible = visibleStandings.some(e => e.isPlayer);
  // 含まれていなければ選手チームも追記
  const playerEntry = standings.find(e => e.isPlayer);
  const finalStandings = playerVisible
    ? visibleStandings
    : playerEntry
      ? [...visibleStandings, playerEntry]
      : visibleStandings;

  return (
    <div className="gl-card mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wide">
            📋 リーグ順位表
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {league.country} — {league.name}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-black" style={{ color: playerRank <= 3 ? '#FFD700' : playerRank <= 6 ? '#22c55e' : 'var(--fg-1)' }}>
            {playerRank}位
          </span>
          <span className="text-xs text-text-secondary ml-1">/ {totalTeams}チーム</span>
        </div>
      </div>

      {/* チーム情報 */}
      <div className="rounded-lg p-3 mb-3 border" style={{
        background: 'var(--bg-surface-elevated)',
        borderColor: 'var(--color-accent-green)',
        borderLeftWidth: '3px',
      }}>
        <p className="text-xs font-bold text-text-primary mb-0.5">
          ▶ {state.currentTeam.name}
        </p>
        <p className="text-xs text-text-secondary">{getTeamStyle(state.currentTeam.id)}</p>
        <p className="text-xs text-text-secondary mt-0.5">
          週給 {state.currentTeam.salary}万円 · 格 {state.currentTeam.prestige}/6
        </p>
      </div>

      {/* 順位表 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-1 pr-1 text-text-secondary font-semibold w-6">#</th>
              <th className="text-left py-1 text-text-secondary font-semibold">チーム</th>
              <th className="text-center py-1 text-text-secondary font-semibold w-7">試</th>
              <th className="text-center py-1 text-text-secondary font-semibold w-7">勝</th>
              <th className="text-center py-1 text-text-secondary font-semibold w-7">分</th>
              <th className="text-center py-1 text-text-secondary font-semibold w-7">敗</th>
              <th className="text-center py-1 text-text-secondary font-semibold w-8">得失</th>
              <th className="text-center py-1 text-text-secondary font-semibold w-8 font-black">点</th>
            </tr>
          </thead>
          <tbody>
            {finalStandings.map((entry, idx) => {
              const rank = standings.findIndex(e => e.teamId === entry.teamId) + 1;
              const gd = entry.goalsFor - entry.goalsAgainst;
              const isPlayer = entry.isPlayer;
              const isChampion = rank === 1;
              const isPromotion = rank <= 3;

              return (
                <tr
                  key={entry.teamId}
                  className={`border-b border-[var(--color-border)] ${isPlayer ? 'font-bold' : ''}`}
                  style={isPlayer ? { background: 'rgba(0,210,106,0.08)' } : undefined}
                >
                  <td className="py-1.5 pr-1 text-center">
                    <span className={`font-bold ${
                      isChampion ? 'text-yellow-400' :
                      isPromotion ? 'text-green-400' : 'text-text-secondary'
                    }`}>
                      {rank}
                    </span>
                  </td>
                  <td className="py-1.5 truncate max-w-[120px]">
                    <span className={isPlayer ? 'text-[var(--color-accent-green)]' : 'text-text-primary'}>
                      {isPlayer ? '▶ ' : ''}{entry.teamName}
                    </span>
                  </td>
                  <td className="py-1.5 text-center text-text-secondary">{entry.played}</td>
                  <td className="py-1.5 text-center text-text-secondary">{entry.wins}</td>
                  <td className="py-1.5 text-center text-text-secondary">{entry.draws}</td>
                  <td className="py-1.5 text-center text-text-secondary">{entry.losses}</td>
                  <td className="py-1.5 text-center">
                    <span className={gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-text-secondary'}>
                      {gd > 0 ? `+${gd}` : gd}
                    </span>
                  </td>
                  <td className="py-1.5 text-center font-bold text-text-primary">{entry.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalTeams > 8 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-2 w-full text-xs text-text-secondary hover:text-text-primary transition-colors py-1"
        >
          {showAll ? '▲ 折りたたむ' : `▼ 全${totalTeams}チームを表示`}
        </button>
      )}

      {/* 凡例 */}
      <div className="flex gap-3 mt-2 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="text-yellow-400 font-bold">1</span><span>優勝</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="text-green-400 font-bold">2-3</span><span>昇格圏</span>
        </div>
      </div>
    </div>
  );
}
