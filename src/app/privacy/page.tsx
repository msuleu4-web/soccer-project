export const metadata = {
  title: 'プライバシーポリシー | Goal Labo',
  description: 'Goal Laboのプライバシーポリシー（個人情報保護方針）',
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-[var(--gl-color-text-muted)]">

        <p>
          Goal Labo（以下「当サイト」）は、ユーザーの個人情報の取扱いについて、
          以下のとおりプライバシーポリシーを定めます。
        </p>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">1. 収集する情報</h2>
          <p>当サイトでは、以下の情報を収集する場合があります：</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>メールアドレス（会員登録・ログイン時）</li>
            <li>Google アカウント情報（Google OAuth ログイン利用時）</li>
            <li>匿名識別子（掲示板利用時、ブラウザのローカルストレージに保存）</li>
            <li>Cookie 及びアクセスログ情報</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">2. 情報の利用目的</h2>
          <p>収集した情報は、以下の目的で利用します：</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>ユーザー認証およびアカウント管理</li>
            <li>サービスの提供・改善・新機能の開発</li>
            <li>お問い合わせへの対応</li>
            <li>利用状況の分析（アクセス解析）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">3. 第三者提供</h2>
          <p>
            当サイトは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">4. 広告について</h2>
          <p>
            当サイトでは、第三者配信の広告サービス（Google AdSense）を利用することがあります。
            広告配信事業者は、ユーザーの興味に応じた広告を表示するために Cookie を使用することがあります。
          </p>
          <p className="mt-2">
            Google が広告の配信に Cookie を使用する仕組みについては、
            <a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-[var(--gl-color-accent)] underline">
              Google の広告に関するポリシー
            </a>
            をご参照ください。
          </p>
          <p className="mt-2">
            ユーザーは、Google の
            <a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-[var(--gl-color-accent)] underline">
              広告設定ページ
            </a>
            からパーソナライズ広告を無効にすることができます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">5. アクセス解析ツール</h2>
          <p>
            当サイトでは、アクセス解析のために Google Analytics 等のツールを使用する場合があります。
            これらのツールはトラフィックデータの収集のために Cookie を使用しています。
            ユーザーはブラウザの設定で Cookie を無効にすることで、データ収集を拒否することができます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">6. 免責事項</h2>
          <p>
            当サイトの「監督AIシミュレーター」機能は AI が生成したフィクションです。
            実在の選手名を使用していますが、実際の選手の能力・性格を反映するものではなく、
            すべての描写は架空のものです。
          </p>
          <p className="mt-2">
            当サイトからのリンクやバナーなどで移動した先のサイトで提供される情報・サービスについて、
            当サイトは一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">7. 著作権</h2>
          <p>
            当サイトに掲載されているコンテンツ（文章・画像・デザイン等）の著作権は当サイト運営者に帰属します。
            無断転載・複製は禁止します。
          </p>
          <p className="mt-2">
            選手名・チーム名等は各権利者に帰属し、当サイトは情報提供の目的でのみ使用しています。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">8. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、サイト内のお問い合わせフォームまたは
            以下のメールアドレスまでお願いいたします。
          </p>
          <p className="mt-2 font-medium text-[var(--gl-color-text)]">
            メール: contact@goal-labo.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--gl-color-text)] mt-8 mb-3">9. ポリシーの変更</h2>
          <p>
            当サイトは、必要に応じて本ポリシーを変更することがあります。
            変更後のポリシーは、当ページに掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <div className="mt-12 pt-6 border-t border-[var(--gl-color-border)]">
          <p className="text-xs">制定日: 2026年5月18日</p>
          <p className="text-xs">最終更新日: 2026年5月18日</p>
          <p className="text-xs mt-1">Goal Labo 運営者</p>
        </div>

      </div>
    </main>
  );
}
