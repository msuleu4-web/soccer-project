import { useState } from 'react';
import { Trophy } from 'lucide-react';

const plStandings = [
    { rank: 1, team: 'アーセナル', points: 77, w: 24, d: 5, l: 5 },
    { rank: 2, team: 'マンチェスター・C', points: 76, w: 23, d: 7, l: 3 },
    { rank: 3, team: 'リヴァプール', points: 74, w: 22, d: 8, l: 4 },
    { rank: 4, team: 'アストン・ヴィラ', points: 66, w: 20, d: 6, l: 8 },
    { rank: 5, team: 'トッテナム', points: 60, w: 18, d: 6, l: 9 },
];

const j1Standings = [
    { rank: 1, team: '町田ゼルビア', points: 22, w: 7, d: 1, l: 1 },
    { rank: 2, team: 'セレッソ大阪', points: 20, w: 5, d: 5, l: 0 },
    { rank: 3, team: 'サンフレッチェ広島', points: 18, w: 4, d: 6, l: 0 },
    { rank: 4, team: 'ヴィッセル神戸', points: 17, w: 5, d: 2, l: 2 },
    { rank: 5, team: '鹿島アントラーズ', points: 16, w: 5, d: 1, l: 3 },
];

const RankCell = ({ rank }: { rank: number }) => {
  const rankColor: { [key: number]: string } = {
    1: 'text-rank-gold',
    2: 'text-rank-silver',
    3: 'text-rank-bronze',
  };

  return (
    <td className={`px-2 py-3 text-center font-semibold flex items-center justify-center gap-1.5 ${rankColor[rank] || 'text-text-muted'}`}>
      {rank <= 3 && <Trophy size={14} className={rankColor[rank]} />}
      <span>{rank}</span>
    </td>
  );
};

const StandingsSection = () => {
  const [activeTab, setActiveTab] = useState('PL');

  const standings = activeTab === 'PL' ? plStandings : j1Standings;

  return (
    <div className="gl-card">
      <h2 className="text-xl font-bold text-text-primary mb-4">リーグ順位</h2>
      <div>
          <div className="flex border-b border-border">
              <button 
                  onClick={() => setActiveTab('PL')}
                  className={`py-2 px-4 font-semibold transition-colors text-sm ${activeTab === 'PL' ? 'text-text-primary border-b-2 border-accent-green' : 'text-text-secondary hover:text-text-primary'}`}>
                  Premier League
              </button>
              <button 
                  onClick={() => setActiveTab('J1')}
                  className={`py-2 px-4 font-semibold transition-colors text-sm ${activeTab === 'J1' ? 'text-text-primary border-b-2 border-accent-green' : 'text-text-secondary hover:text-text-primary'}`}>
                  J1リーグ
              </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-thead">
                <tr className="text-xs text-text-muted">
                  <th className="px-2 py-2 font-medium text-center">順位</th>
                  <th className="px-2 py-2 font-medium">クラブ</th>
                  <th className="px-2 py-2 font-medium text-center">勝点</th>
                  <th className="px-2 py-2 font-medium text-center">勝</th>
                  <th className="px-2 py-2 font-medium text-center">分</th>
                  <th className="px-2 py-2 font-medium text-center">敗</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => (
                    <tr key={s.rank} className="border-t border-border hover:bg-row-hover transition-colors">
                        <RankCell rank={s.rank} />
                        <td className="px-2 py-3 font-bold text-text-primary">{s.team}</td>
                        <td className="px-2 py-3 text-center font-bold text-text-primary">{s.points}</td>
                        <td className="px-2 py-3 text-center text-text-secondary">{s.w}</td>
                        <td className="px-2 py-3 text-center text-text-secondary">{s.d}</td>
                        <td className="px-2 py-3 text-center text-text-secondary">{s.l}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default StandingsSection;
