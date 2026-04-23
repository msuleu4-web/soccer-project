import { Shield } from 'lucide-react';

const matches = [
  { teamA: '川崎フロンターレ', teamB: '横浜F・マリノス', score: '1 - 2', league: 'J1' },
  { teamA: 'マンチェスター・C', teamB: 'アーセナル', score: '20:00', league: 'PL' },
  { teamA: 'レアル・マドリード', teamB: 'FCバルセロナ', score: '22:00', league: 'LaLiga' },
  { teamA: '浦和レッズ', teamB: '鹿島アントラーズ', score: '2 - 2', league: 'J1' },
];

const MatchSection = () => {
  return (
    <div className="section-container">
      <h2 className="text-xl font-bold text-text-primary mb-4">本日の試合</h2>
      <div className="flex flex-col">
        {matches.map((match, index) => (
          <div key={index} className={`flex items-center w-full py-3 ${index < matches.length - 1 ? 'border-b border-gray-800' : ''}`}>
            <span className="w-16 text-center text-xs font-medium text-text-secondary">{match.league}</span>
            <div className="flex-1 flex justify-end items-center gap-3">
              <span className="font-semibold text-text-primary text-sm md:text-base text-right">{match.teamA}</span>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="w-24 text-center font-black text-lg text-text-primary">{match.score}</div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-500" />
              </div>
              <span className="font-semibold text-text-primary text-sm md:text-base">{match.teamB}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchSection;
