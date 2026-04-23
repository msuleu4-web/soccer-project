const newsItems = [
  { league: 'J1', title: 'ヴィッセル神戸、首位固め。古橋が決勝ゴール', date: '2024-04-22' },
  { league: 'PL', title: 'ハーランドのハットトリックでマンチェスターシティが快勝', date: '2024-04-22' },
  { league: 'LaLiga', title: '久保建英、2試合連続アシストでチームの勝利に貢献', date: '2024-04-21' },
  { league: 'SerieA', title: 'インテル、スクデット獲得に王手。ラウタロが2得点', date: '2024-04-21' },
];

const Badge = ({ league }: { league: string }) => {
  return (
    <span className={`gl-badge gl-badge-${league.toLowerCase()}`}>
      {league}
    </span>
  );
};

const NewsSection = () => {
  return (
    <div className="gl-card">
      <h2 className="text-xl font-bold text-text-primary mb-4">最新ニュース</h2>
      <div className="flex flex-col">
        {newsItems.map((item, index) => (
          <div key={index} className={`flex items-center gap-4 py-3 ${index < newsItems.length - 1 ? 'border-b border-border' : ''}`}>
            <div className="w-24 h-16 bg-surface-elevated rounded-md flex-shrink-0"></div>
            <div className="flex flex-col gap-1">
              <Badge league={item.league} />
              <h3 className="news-title text-base">
                {item.title}
              </h3>
              <p className="text-xs text-text-muted">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
