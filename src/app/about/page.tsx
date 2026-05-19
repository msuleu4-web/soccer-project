export const metadata = {
  title: 'About | Goal Labo',
  description: 'Goal Laboについて — AIを活用したサッカー情報プラットフォーム',
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">About Goal Labo</h1>
      <p className="text-[var(--gl-color-text-muted)] mb-10">
        AIを活用したサッカー情報プラットフォーム
      </p>

      <div className="space-y-8">

        <section className="gl-card p-6">
          <h2 className="text-xl font-bold mb-3">⚽ Goal Labo とは</h2>
          <p className="text-[var(--gl-color-text-muted)] leading-relaxed">
            Goal Labo は、サッカーファンのための情報プラットフォームです。
            プレミアリーグとJ1リーグを中心に、最新ニュース・リーグ順位・試合情報を提供します。
          </p>
          <p className="text-[var(--gl-color-text-muted)] leading-relaxed mt-3">
            AIテクノロジーを活用した独自の機能で、これまでにないサッカー体験をお届けします。
          </p>
        </section>

        <section className="gl-card p-6">
          <h2 className="text-xl font-bold mb-4">🎮 主な機能</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-[var(--gl-color-accent)]">🏟️ 監督AIシミュレーター</h3>
              <p className="text-sm text-[var(--gl-color-text-muted)] mt-1">
                2チームを選び、フォーメーションと戦術スタイルを設定すると、
                AIが90分間の架空の試合をリアルタイム実況形式で生成します。
                360名以上の実在選手データと能力値を搭載し、リーグレベル差も反映したリアリティのある結果をお楽しみいただけます。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--gl-color-accent)]">📰 ニュース</h3>
              <p className="text-sm text-[var(--gl-color-text-muted)] mt-1">
                世界中のサッカーニュースを日本語でお届け。海外リーグからJリーグまで幅広くカバーします。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--gl-color-accent)]">📊 リーグ順位</h3>
              <p className="text-sm text-[var(--gl-color-text-muted)] mt-1">
                プレミアリーグ・J1リーグの最新順位表を確認できます。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--gl-color-accent)]">💬 掲示板</h3>
              <p className="text-sm text-[var(--gl-color-text-muted)] mt-1">
                チームごとの匿名掲示板。会員登録なしで投稿・コメント・推薦ができます。
                20チーム対応（PL10チーム + J1リーグ10チーム）。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--gl-color-accent)]">🤖 マンUくん</h3>
              <p className="text-sm text-[var(--gl-color-text-muted)] mt-1">
                マンチェスター・ユナイテッド専門のAIチャットボット。
                クラブの歴史、選手情報、試合分析など何でも聞けます。
              </p>
            </div>
          </div>
        </section>

        <section className="gl-card p-6">
          <h2 className="text-xl font-bold mb-3">🛠️ 技術</h2>
          <p className="text-sm text-[var(--gl-color-text-muted)] leading-relaxed">
            Next.js 14 / React 18 / TypeScript / Tailwind CSS / Supabase / Groq AI を使用し、
            モダンなWeb技術で構築されています。
          </p>
        </section>

        <section className="gl-card p-6">
          <h2 className="text-xl font-bold mb-3">🌍 対象リーグ・チーム</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-bold text-sm mb-2">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</h3>
              <p className="text-xs text-[var(--gl-color-text-muted)] leading-relaxed">
                アーセナル / アストン・ヴィラ / チェルシー / エヴァートン /
                リヴァプール / マンチェスター・シティ / マンチェスター・ユナイテッド /
                ニューカッスル / トッテナム / ウェストハム
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-2">🇯🇵 J1リーグ</h3>
              <p className="text-xs text-[var(--gl-color-text-muted)] leading-relaxed">
                鹿島アントラーズ / 浦和レッズ / 川崎フロンターレ / 横浜F・マリノス /
                ヴィッセル神戸 / サンフレッチェ広島 / セレッソ大阪 / ガンバ大阪 /
                名古屋グランパス / 町田ゼルビア
              </p>
            </div>
          </div>
        </section>

        <section className="gl-card p-6">
          <h2 className="text-xl font-bold mb-3">⚠️ 免責事項</h2>
          <p className="text-sm text-[var(--gl-color-text-muted)] leading-relaxed">
            当サイトのAIシミュレーション機能は、AIが生成したフィクションです。
            実在の選手名・チーム名を使用していますが、実際の選手の能力を正確に反映するものではありません。
            エンターテインメント目的でお楽しみください。
          </p>
          <p className="text-sm text-[var(--gl-color-text-muted)] leading-relaxed mt-2">
            詳しくは <a href="/privacy" className="text-[var(--gl-color-accent)] underline">プライバシーポリシー</a> をご覧ください。
          </p>
        </section>

        <section className="gl-card p-6">
          <h2 className="text-xl font-bold mb-3">📧 お問い合わせ</h2>
          <p className="text-sm text-[var(--gl-color-text-muted)]">
            ご質問・ご要望・バグ報告は以下までお願いします。
          </p>
          <p className="text-sm font-medium mt-2">
            contact@goal-labo.com
          </p>
        </section>

      </div>
    </main>
  );
}
