const newsItems = [
  { league: 'J1', title: 'ヴィッセル神戸、首位固め。古橋が決勝ゴール', date: '2024-04-22' },
  { league: 'PL', title: 'ハーランドのハットトリックでマンチェスターシティが快勝', date: '2024-04-22' },
  { league: 'La Liga', title: '久保建英、2試合連続アシストでチームの勝利に貢献', date: '2024-04-21' },
  { league: 'Serie A', title: 'インテル、スクデット獲得に王手。ラウタロが2得点', date: '2024-04-21' },
];

const Badge = ({ league }: { league: string }) => {
  const leagueColors: { [key: string]: string } = {
    'J1': 'bg-red-500/20 text-red-400',
    'PL': 'bg-purple-500/20 text-purple-400',
    'La Liga': 'bg-orange-500/20 text-orange-400',
    'Serie A': 'bg-blue-500/20 text-blue-400',
  };

  return (
    <span className={`league-badge ${leagueColors[league] || 'bg-gray-500/20 text-gray-400'}`}>
      {league}
    </span>
  );
};

const NewsSection = () => {
  return (
    <div className="section-container">
      <h2 className="text-xl font-bold text-text-primary mb-4">最新ニュース</h2>
      <div className="flex flex-col">
        {newsItems.map((item, index) => (
          <div key={index} className={`flex items-center gap-4 py-3 ${index < newsItems.length - 1 ? 'border-b border-gray-800' : ''}`}>
            <div className="w-24 h-16 bg-gray-800 rounded-md flex-shrink-0"></div>
            <div className="flex flex-col gap-1">
              <Badge league={item.league} />
              <h3 className="news-title text-base">
                {item.title}
              </h3>
              <p className="text-xs text-text-secondary">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
