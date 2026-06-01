import type { GameEvent, GameState } from '../types/game';

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'sponsor_contract',
    title: 'スポンサー契約のオファー',
    description: '地元企業からスポンサー契約のオファーが届いた。契約すれば収入が増えるが、CMの撮影で練習時間が削られる。',
    choices: [
      {
        label: '契約する（+200万円）',
        effect: { money: 200, stamina: -1 },
      },
      {
        label: '断る（練習に集中）',
        effect: { shooting: 1, passing: 1 },
      },
    ],
  },
  {
    id: 'training_discomfort',
    title: '練習中の違和感',
    description: '練習中に足に違和感を覚えた。このまま続けるべきか、無理せず休むべきか...',
    choices: [
      {
        label: '無理して続ける',
        effect: { shooting: 2, injury: 1 },
      },
      {
        label: '今日は休む',
        effect: { stamina: 1, morale: -5 },
      },
    ],
  },
  {
    id: 'national_call',
    title: '代表招集！',
    description: '日本代表チームから召集の連絡が届いた！これはキャリアの大きな転機だ。',
    choices: [
      {
        label: '喜んで参加する！',
        effect: { morale: 20, money: 100 },
      },
      {
        label: '怪我のリスクを考えて辞退する',
        effect: { morale: -10, stamina: 2 },
      },
    ],
    condition: (state: GameState) => state.ovr >= 65,
  },
  {
    id: 'teammate_clash',
    title: 'チームメイトとの衝突',
    description: '試合中のポジショニングを巡ってチームメイトと激しい口論になった。',
    choices: [
      {
        label: '謝罪して関係を修復する',
        effect: { morale: 5, passing: 1 },
      },
      {
        label: '自分の考えを主張する',
        effect: { morale: -10, shooting: 2 },
      },
    ],
  },
  {
    id: 'coach_criticism',
    title: '監督からの叱責',
    description: '試合後のミーティングで監督から厳しい指摘を受けた。「もっと積極的にプレーしろ！」',
    choices: [
      {
        label: '真摯に受け止め猛練習する',
        effect: { shooting: 2, dribbling: 1, morale: -5 },
      },
      {
        label: '気にせず自分のペースで行く',
        effect: { morale: 5 },
      },
    ],
  },
  {
    id: 'fan_letter',
    title: 'ファンレター',
    description: '熱狂的なファンから感動的なファンレターが届いた。「あなたのプレーに勇気をもらいました」',
    choices: [
      {
        label: '返事を書く（時間がかかるが心が温まる）',
        effect: { morale: 15, money: 0 },
      },
      {
        label: '練習に集中する',
        effect: { stamina: 1, speed: 1 },
      },
    ],
  },
  {
    id: 'romance_scandal',
    title: '恋愛スキャンダル',
    description: '週刊誌に恋愛スキャンダルが報じられた。チームの雰囲気が微妙になっている...',
    choices: [
      {
        label: '記者会見で否定する',
        effect: { morale: -5, money: -50 },
      },
      {
        label: '沈黙を守る',
        effect: { morale: -10 },
      },
    ],
  },
  {
    id: 'sns_firestorm',
    title: 'SNS炎上',
    description: '試合後の発言がSNSで炎上してしまった。批判コメントが止まらない...',
    choices: [
      {
        label: '謝罪ツイートを投稿する',
        effect: { morale: -5 },
      },
      {
        label: 'SNSアカウントを一時停止する',
        effect: { morale: -15, stamina: 2 },
      },
    ],
  },
  {
    id: 'charity_activity',
    title: 'チャリティ活動への招待',
    description: '地域の子どもたちを対象にしたサッカー教室への参加を依頼された。',
    choices: [
      {
        label: '喜んで参加する',
        effect: { morale: 20, money: -20 },
      },
      {
        label: '断る（練習を優先）',
        effect: { stamina: 2, dribbling: 1 },
      },
    ],
  },
  {
    id: 'overseas_media',
    title: '海外メディアの注目',
    description: 'ヨーロッパの有名メディアがあなたのプレーを特集した。海外移籍の可能性が高まっている。',
    choices: [
      {
        label: 'インタビューに応じる',
        effect: { morale: 15, money: 80 },
      },
      {
        label: 'プレーで答える',
        effect: { shooting: 2, speed: 1 },
      },
    ],
    condition: (state: GameState) => state.ovr >= 70,
  },
  {
    id: 'young_player_rise',
    title: '若手選手の台頭',
    description: 'チームに才能あふれる若手選手が加入した。レギュラーポジションが脅かされている。',
    choices: [
      {
        label: 'ライバルとして切磋琢磨する',
        effect: { shooting: 2, morale: -5 },
      },
      {
        label: '先輩として指導する',
        effect: { morale: 10, passing: 2 },
      },
    ],
  },
  {
    id: 'veteran_advice',
    title: 'ベテランからのアドバイス',
    description: 'チームのベテラン選手から特別な練習の秘訣を教わった。',
    choices: [
      {
        label: '熱心に学ぶ',
        effect: { defense: 2, stamina: 2, morale: 10 },
      },
      {
        label: '自分のスタイルを貫く',
        effect: { shooting: 2, dribbling: 1 },
      },
    ],
  },
  {
    id: 'derby_match_eve',
    title: 'ダービーマッチ前夜',
    description: '明日は最大のライバルチームとのダービーマッチ。サポーターの期待が高まっている。',
    choices: [
      {
        label: '特別なルーティンで準備する',
        effect: { morale: 15, shooting: 1 },
      },
      {
        label: 'いつも通りのルーティンを守る',
        effect: { morale: 5, stamina: 1 },
      },
    ],
  },
  {
    id: 'injury_recovery_bonus',
    title: '完全復活！',
    description: '長期の怪我から完全に回復した。体が軽く感じられる。今がチャンスだ！',
    choices: [
      {
        label: '復帰戦で全力を出す',
        effect: { morale: 20, speed: 3, shooting: 2 },
      },
      {
        label: '慎重に段階的に戻す',
        effect: { stamina: 3, morale: 10 },
      },
    ],
    condition: (state: GameState) => state.injury === 0 && state.previousInjury === true,
  },
  {
    id: 'transfer_rumor',
    title: '移籍の噂',
    description: '海外クラブがあなたに興味を持っているという噂がスポーツ紙に載った。',
    choices: [
      {
        label: '「集中する」とコメントする',
        effect: { morale: 5 },
      },
      {
        label: '移籍について真剣に考える',
        effect: { morale: 10, money: 50 },
      },
    ],
  },
  {
    id: 'ballon_dor_buzz',
    title: 'バロンドール候補報道！',
    description: '今年のバロンドール候補としてあなたの名前が挙がっている！世界中のファンが注目している。',
    choices: [
      {
        label: 'プレッシャーをエネルギーに変える',
        effect: { morale: 25, shooting: 3, dribbling: 2 },
      },
      {
        label: '冷静に自分のプレーに集中する',
        effect: { morale: 15, passing: 2, stamina: 2 },
      },
    ],
    condition: (state: GameState) => state.ovr >= 88,
  },
  {
    id: 'food_poisoning',
    title: '食中毒',
    description: '遠征先のレストランで食事をした後、体調が悪化した。食中毒のようだ...',
    choices: [
      {
        label: '病院に行って治療を受ける',
        effect: { money: -30, stamina: -2, morale: -10 },
      },
      {
        label: '無理して次の試合に出る',
        effect: { injury: 1, morale: -5 },
      },
    ],
  },
  {
    id: 'absence_crisis',
    title: '欠場危機',
    description: '疲労が限界に達している。医師から「このままでは怪我をする」と警告を受けた。',
    choices: [
      {
        label: '医師の言葉に従って休む',
        effect: { stamina: 3, morale: -5 },
      },
      {
        label: '試合に出続ける',
        effect: { shooting: 1, injury: 1 },
      },
    ],
    condition: (state: GameState) => state.fatigue >= 70,
  },
  {
    id: 'team_slump',
    title: 'チームの連敗スランプ',
    description: 'チームが5連敗中。ロッカールームの雰囲気は最悪だ。どう対処する？',
    choices: [
      {
        label: 'チームを鼓舞するスピーチをする',
        effect: { morale: 15, passing: 2 },
      },
      {
        label: '自分のプレーで引っ張る',
        effect: { shooting: 3, morale: -5 },
      },
    ],
  },
  {
    id: 'championship_parade',
    title: '優勝パレード！',
    description: 'チームが優勝し、街を挙げてのパレードが開催された！',
    choices: [
      {
        label: 'パレードを心ゆくまで楽しむ',
        effect: { morale: 30, money: 100 },
      },
      {
        label: '来シーズンに向けて既に気持ちを切り替える',
        effect: { morale: 20, stamina: 2, shooting: 1 },
      },
    ],
  },
  {
    id: 'parents_letter',
    title: '親からの手紙',
    description: '故郷の両親から手紙が届いた。「いつも応援しているよ。体に気をつけてね」',
    choices: [
      {
        label: '実家に電話して近況を報告する',
        effect: { morale: 20 },
      },
      {
        label: '手紙の返事を丁寧に書く',
        effect: { morale: 15, money: 0 },
      },
    ],
  },
  {
    id: 'coach_change',
    title: 'コーチ変更',
    description: '新しいコーチが就任した。戦術が大きく変わり、あなたへの要求も変わってきた。',
    choices: [
      {
        label: '新戦術に素早く適応する',
        effect: { passing: 2, defense: 1, morale: -5 },
      },
      {
        label: 'じっくり自分のプレーを見直す',
        effect: { morale: 5, stamina: 2 },
      },
    ],
  },
  {
    id: 'atmosphere_overwhelmed',
    title: 'スタジアムの雰囲気に飲まれる',
    description: '大観衆の前で緊張してしまった。試合前から心拍数が上がっている...',
    choices: [
      {
        label: '深呼吸して集中する',
        effect: { morale: 5, shooting: 1 },
      },
      {
        label: 'ルーティンを実行する',
        effect: { morale: -5, dribbling: 2 },
      },
    ],
  },
  {
    id: 'hat_trick',
    title: 'ハットトリック達成！',
    description: '今シーズン記念すべきハットトリックを達成！メディアは大興奮だ！',
    choices: [
      {
        label: 'チームメイトに感謝を伝える',
        effect: { morale: 25, passing: 2 },
      },
      {
        label: 'もっと高みを目指すと宣言する',
        effect: { morale: 20, shooting: 3 },
      },
    ],
    condition: (state: GameState) => (state.seasonHatTricks ?? 0) >= 1,
  },
  {
    id: 'captain_offer',
    title: 'キャプテン就任オファー',
    description: '監督から来シーズンのキャプテンに指名されたいとオファーを受けた！',
    choices: [
      {
        label: '喜んで引き受ける',
        effect: { morale: 30, passing: 2, defense: 1 },
      },
      {
        label: '今はプレーに集中したい',
        effect: { morale: 5, shooting: 2, dribbling: 1 },
      },
    ],
  },
  // 追加イベント

  {
    id: 'secret_training',
    title: '伝説のコーチとの出会い',
    description: '公園で自主練していると、かつて代表を率いた伝説のコーチに声をかけられた。「君には才能がある。少し教えようか？」',
    choices: [
      { label: '教えてもらう', effect: { shooting: 4, dribbling: 3, morale: 20 } },
      { label: '丁重に断る', effect: { morale: 5 } },
    ],
  },
  {
    id: 'nightmare_before_match',
    title: '試合前夜の悪夢',
    description: '大事な試合の前夜、ゴールを外し続ける悪夢を見て目が覚めた。もう朝3時だ。',
    choices: [
      { label: 'もう一度寝ようとする', effect: { stamina: -1, morale: -5 } },
      { label: '起きてイメージトレーニングをする', effect: { shooting: 2, morale: 10 } },
    ],
  },
  {
    id: 'sports_documentary',
    title: 'ドキュメンタリー撮影',
    description: 'テレビ局があなたの密着ドキュメンタリーを制作したいと申し込んできた。',
    choices: [
      { label: '受け入れる', effect: { money: 150, morale: 10, stamina: -2 } },
      { label: '断ってプレーに集中する', effect: { shooting: 2, passing: 1, dribbling: 1 } },
    ],
    condition: (state: GameState) => state.ovr >= 60,
  },
  {
    id: 'boot_deal',
    title: 'スパイク専属契約',
    description: '大手スポーツメーカーから専属スパイク契約のオファーが届いた。最新モデルを無償提供してくれるという。',
    choices: [
      { label: '契約する', effect: { money: 300, speed: 2, morale: 15 } },
      { label: '今のスパイクへのこだわりを貫く', effect: { dribbling: 3, morale: 5 } },
    ],
    condition: (state: GameState) => state.ovr >= 55,
  },
  {
    id: 'tactical_study',
    title: '戦術書を発見',
    description: '図書館で偶然、往年の名将が書いた戦術書を見つけた。読み込めばサッカーIQが上がりそうだ。',
    choices: [
      { label: '一晩かけて読み込む', effect: { passing: 4, defense: 2, stamina: -1 } },
      { label: '休息を優先する', effect: { stamina: 2 } },
    ],
  },
  {
    id: 'street_soccer',
    title: '路上サッカーの挑戦',
    description: '練習帰りに若者たちに「1on1勝負しようぜ！」と声をかけられた。',
    choices: [
      { label: '勝負を受ける', effect: { dribbling: 4, speed: 2, morale: 15 } },
      { label: '怪我のリスクがあるので断る', effect: { morale: -5 } },
    ],
  },
  {
    id: 'energy_drink_ad',
    title: 'エナジードリンクCM',
    description: '有名エナジードリンクブランドからCM出演のオファーが来た。ギャラは破格だが…体への影響が心配だ。',
    choices: [
      { label: '出演する', effect: { money: 400, stamina: -3, morale: 5 } },
      { label: '断る', effect: { stamina: 1 } },
    ],
  },
  {
    id: 'unexpected_goal',
    title: '信じられないスーパーゴール',
    description: 'ハーフウェーライン付近から放ったシュートがGKの頭上を越えた！SNSで世界中に拡散されている！',
    choices: [
      { label: '「狙っていた」とコメントする', effect: { morale: 25, money: 100, shooting: 2 } },
      { label: '「ラッキーだった」と正直に話す', effect: { morale: 15, passing: 2 } },
    ],
  },
  {
    id: 'team_camp',
    title: 'チームキャンプ合宿',
    description: '山奥で1週間の強化合宿が始まった。環境は厳しいが仲間との絆が深まりそうだ。',
    choices: [
      { label: '限界まで追い込む', effect: { stamina: 5, speed: 3, morale: -10 } },
      { label: 'チームワークを大切にする', effect: { passing: 4, morale: 20 } },
    ],
  },
  {
    id: 'foreign_player_mentor',
    title: '外国人選手の指導',
    description: '新加入の外国人スター選手が個人的に練習のコツを教えてくれた。',
    choices: [
      { label: '積極的に吸収する', effect: { dribbling: 3, shooting: 2, morale: 15 } },
      { label: '自分のスタイルを守る', effect: { speed: 2, morale: 5 } },
    ],
    condition: (state: GameState) =>
      state.currentLeague === 'j1' ||
      state.currentLeague === 'premier_league' ||
      state.currentLeague === 'champions_league',
  },
  {
    id: 'pre_season_interview',
    title: 'プレシーズンインタビュー',
    description: '「今シーズンの目標は？」とメディアに問われた。どう答える？',
    choices: [
      { label: '「優勝しか考えていない」と宣言する', effect: { morale: 20, shooting: 1 } },
      { label: '「チームに貢献したい」と謙虚に答える', effect: { morale: 10, passing: 2 } },
      { label: '「日々成長すること」と答える', effect: { morale: 8, stamina: 2, dribbling: 1 } },
    ],
  },
  {
    id: 'sleepless_night',
    title: '眠れない夜',
    description: 'スランプが続き、夜も眠れなくなってきた。ベッドの中で色々考えてしまう。',
    choices: [
      { label: '信頼できる仲間に相談する', effect: { morale: 15, passing: 1 } },
      { label: 'ノートに思いを書き出す', effect: { morale: 10 } },
      { label: '無理やり寝る', effect: { stamina: -2, morale: -5 } },
    ],
  },
  {
    id: 'old_rival',
    title: '旧友ライバルとの再会',
    description: '少年時代のライバルが同じリーグに入ってきた。「また勝負しようぜ」と笑顔で言われた。',
    choices: [
      { label: '闘志に火がつく', effect: { shooting: 3, dribbling: 2, morale: 20 } },
      { label: '仲良く切磋琢磨する', effect: { passing: 3, morale: 15 } },
    ],
  },
  {
    id: 'rain_training',
    title: '土砂降りの練習',
    description: '激しい雨の中での練習。「今日は中止にするか？」と聞かれた。',
    choices: [
      { label: '雨の中でも練習する', effect: { stamina: 3, defense: 2, morale: -5 } },
      { label: 'ジムで室内トレーニングに切り替える', effect: { speed: 2, shooting: 1 } },
    ],
  },
  {
    id: 'penalty_miss',
    title: 'PKを外してしまった',
    description: '重要な場面でPKを外した。サポーターからのブーイングが頭から離れない。',
    choices: [
      { label: '次の練習で100本PKを蹴り込む', effect: { shooting: 4, morale: -5 } },
      { label: 'チームメイトに励まされ立ち直る', effect: { morale: 10, passing: 1 } },
    ],
  },
  {
    id: 'meditation_retreat',
    title: 'メンタルコーチとの特訓',
    description: 'チームの心理士から「メンタルトレーニングをしてみないか？」と提案された。',
    choices: [
      { label: '積極的に取り組む', effect: { morale: 25, stamina: 2 } },
      { label: '自分には必要ないと断る', effect: { shooting: 2 } },
    ],
  },
  {
    id: 'late_night_practice',
    title: '深夜の自主練',
    description: 'スタジアムのライトが消えた後も一人居残り練習を続けた。守衛に「もう帰れ」と言われた。',
    choices: [
      { label: 'もう少しだけ練習する', effect: { shooting: 3, dribbling: 2, stamina: -3 } },
      { label: '素直に帰る', effect: { stamina: 2, morale: 5 } },
    ],
  },
  {
    id: 'video_analysis',
    title: '映像分析セッション',
    description: 'コーチングスタッフが自分のプレー映像を分析してくれた。意外な弱点が見えてきた。',
    choices: [
      { label: '弱点を集中的に克服する', effect: { defense: 4, passing: 2, morale: 10 } },
      { label: '強みをさらに伸ばす', effect: { shooting: 3, dribbling: 2 } },
    ],
  },
  {
    id: 'jersey_number',
    title: '背番号の変更',
    description: '監督から「エースナンバーをつけてほしい」と10番を渡された。重みが違う。',
    choices: [
      { label: 'その重みを力に変える', effect: { morale: 30, shooting: 2, dribbling: 2 } },
      { label: 'プレッシャーを感じて迷う', effect: { morale: 10 } },
    ],
    condition: (state: GameState) => state.ovr >= 60 && state.currentSeason >= 2,
  },
  {
    id: 'goal_celebration_viral',
    title: 'ゴールパフォーマンスが話題に',
    description: '試合後のゴールパフォーマンスが話題になり、世界中でマネされている！',
    choices: [
      { label: 'ブランド化してグッズ展開する', effect: { money: 200, morale: 20 } },
      { label: 'プレーで注目されたいと思う', effect: { morale: 15, shooting: 2 } },
    ],
  },
  {
    id: 'academy_visit',
    title: 'ユースアカデミーへの訪問',
    description: '地元のユースアカデミーを訪問した。子供たちの目が輝いている。',
    choices: [
      { label: '練習を一緒にする', effect: { morale: 25, dribbling: 2 } },
      { label: '激励のスピーチをする', effect: { morale: 20, passing: 2 } },
    ],
  },
  {
    id: 'superstition',
    title: '験担ぎのルーティン',
    description: '左足から靴を履く、試合前に同じ食事をとるなど、こだわりのルーティンが生まれた。',
    choices: [
      { label: '完璧にルーティンを守る', effect: { morale: 20, shooting: 2 } },
      { label: '科学的なアプローチに切り替える', effect: { stamina: 3, speed: 2 } },
    ],
  },
  {
    id: 'heated_derby',
    title: '激闘！因縁のダービー',
    description: '宿命のライバルとのダービー。延長戦まで縺れ込む熱戦となった。',
    choices: [
      { label: '最後まで全力で走り続ける', effect: { morale: 20, stamina: -5, shooting: 2 } },
      { label: '体力を温存してチャンスを狙う', effect: { morale: 10, dribbling: 3 } },
    ],
  },
  {
    id: 'contract_renewal',
    title: 'チームから契約更新の打診',
    description: '現在のチームから長期契約更新のオファーが届いた。条件は悪くないが、移籍の可能性も捨てたくない。',
    choices: [
      { label: '快諾する（+給料アップ）', effect: { money: 200, morale: 15 } },
      { label: '迷って保留する', effect: { morale: -5 } },
    ],
    condition: (state: GameState) => state.currentSeason >= 2,
  },
  {
    id: 'injury_teammate',
    title: 'チームメイトの大怪我',
    description: '試合中、親友のチームメイトが大怪我をした。チーム全体の士気が落ちている。',
    choices: [
      { label: 'チームを引っ張る覚悟をする', effect: { morale: 15, shooting: 3, defense: 1 } },
      { label: '友人の回復を祈りながら静かに準備する', effect: { morale: 5, passing: 3 } },
    ],
  },
  {
    id: 'world_cup_dream',
    title: 'ワールドカップへの夢',
    description: 'テレビで放映中のワールドカップを見ながら「いつかあの舞台に立ちたい」と強く感じた。',
    choices: [
      { label: '夢に向かって猛練習する', effect: { shooting: 3, speed: 2, stamina: -2 } },
      { label: 'モチベーションを胸に秘める', effect: { morale: 25 } },
    ],
  },
  {
    id: 'rain_of_criticism',
    title: 'メディアの集中砲火',
    description: '連続して試合でミスをしたため、スポーツメディアから集中批判を受けている。',
    choices: [
      { label: 'プレーで見返す決意をする', effect: { shooting: 4, morale: -10 } },
      { label: '信頼できる人に相談する', effect: { morale: 5, passing: 2 } },
      { label: 'SNSを全て閉じて練習に打ち込む', effect: { dribbling: 3, stamina: 2, morale: 0 } },
    ],
  },
  {
    id: 'training_ground_prank',
    title: '練習場のドッキリ',
    description: 'チームメイトにドッキリを仕掛けられた。笑いでチームの雰囲気が明るくなった。',
    choices: [
      { label: '大笑いしてチームに溶け込む', effect: { morale: 20, passing: 2 } },
      { label: '仕返しのドッキリを計画する', effect: { morale: 25, dribbling: 1 } },
    ],
  },
  {
    id: 'nutrition_seminar',
    title: '栄養士のアドバイス',
    description: 'チーム専属の栄養士から食事改善の提案を受けた。「今の食生活では限界がある」と言われた。',
    choices: [
      { label: '食事を徹底的に改善する', effect: { stamina: 5, speed: 2, money: -50 } },
      { label: '少しずつ取り入れる', effect: { stamina: 2 } },
    ],
  },
  {
    id: 'match_fixing_rumor',
    title: '八百長疑惑',
    description: '試合後、一部のSNSで八百長疑惑が浮上した。全くの誤解だが対応が必要だ。',
    choices: [
      { label: '弁護士を立てて即座に否定する', effect: { money: -100, morale: 5 } },
      { label: 'プレーで無実を証明する', effect: { shooting: 3, morale: -10 } },
    ],
  },
  {
    id: 'award_ceremony',
    title: '月間最優秀選手賞',
    description: 'リーグの月間最優秀選手に選ばれた！授賞式に出席することになった。',
    choices: [
      { label: 'チームメイトに感謝のスピーチをする', effect: { morale: 30, money: 100, passing: 2 } },
      { label: '「まだまだ上を目指す」と宣言する', effect: { morale: 25, shooting: 3 } },
    ],
    condition: (state: GameState) => state.ovr >= 50 && state.seasonGoals >= 5,
  },
  {
    id: 'altitude_training',
    title: '高地トレーニング',
    description: '夏のオフに山岳地帯での高地トレーニングに参加するチャンスが来た。',
    choices: [
      { label: '参加する', effect: { stamina: 6, speed: 3, money: -80 } },
      { label: 'オフはゆっくり休む', effect: { morale: 15, stamina: 3 } },
    ],
  },
  {
    id: 'match_ball_gift',
    title: 'マッチボールのプレゼント',
    description: '試合で3得点を決め、マッチボールを受け取った。サポーターが興奮している！',
    choices: [
      { label: 'サポーターにボールをプレゼントする', effect: { morale: 30, money: 0 } },
      { label: '大切に持ち帰る', effect: { morale: 20 } },
    ],
    condition: (state: GameState) => state.seasonGoals >= 8,
  },
  {
    id: 'agent_change',
    title: 'エージェント変更の相談',
    description: '実力派の新エージェントから「あなたの価値はもっと高い。私に任せれば年俸を倍にしてみせる」と言われた。',
    choices: [
      { label: '新エージェントに切り替える', effect: { money: 150, morale: -5 } },
      { label: '今のエージェントへの義理を貫く', effect: { morale: 10 } },
    ],
    condition: (state: GameState) => state.currentSeason >= 3,
  },
  {
    id: 'goal_drought',
    title: 'ゴール欠乏症',
    description: '5試合連続でノーゴール。「スランプでは？」という報道が増えてきた。',
    choices: [
      { label: '基本に立ち返り猛練習する', effect: { shooting: 5, morale: -10 } },
      { label: 'ゴールにこだわらずチームプレーに徹する', effect: { passing: 4, morale: 5 } },
    ],
  },
  {
    id: 'stadium_record',
    title: 'スタジアム最多得点記録',
    description: 'このスタジアムでの通算得点記録を更新した！場内アナウンスで名前が呼ばれた。',
    choices: [
      { label: 'さらに記録を伸ばすと宣言する', effect: { morale: 25, shooting: 3 } },
      { label: '記念の瞬間を噛み締める', effect: { morale: 30 } },
    ],
    condition: (state: GameState) => state.totalGoals >= 30,
  },
  {
    id: 'training_innovation',
    title: '新しい練習法の発見',
    description: 'YouTubeで海外の最新トレーニング動画を見て、試してみたくなった。',
    choices: [
      { label: '取り入れてみる', effect: { dribbling: 4, speed: 3, morale: 10 } },
      { label: '実績あるトレーニングを続ける', effect: { shooting: 2, stamina: 2 } },
    ],
  },
  {
    id: 'cl_debut',
    title: 'チャンピオンズリーグデビュー！',
    description: 'ついにヨーロッパ最高峰の舞台に立つ日が来た。スタジアムの雰囲気は別格だ。',
    choices: [
      { label: '緊張を力に変える', effect: { morale: 35, shooting: 3, speed: 2 } },
      { label: '普段通りのプレーを心がける', effect: { morale: 25, passing: 3 } },
    ],
    condition: (state: GameState) => state.currentLeague === 'champions_league' && state.currentSeason >= 1,
  },
  {
    id: 'comeback_from_zero',
    title: '崖っぷちからの復活',
    description: 'チームが降格圏内に入ってしまった。ここが正念場だ。',
    choices: [
      { label: 'チームの精神的支柱になる', effect: { morale: 25, passing: 3, defense: 2 } },
      { label: '個人の力でチームを救う', effect: { shooting: 5, dribbling: 3, morale: -5 } },
    ],
  },

  // 他AIとの協力イベント

  {
    id: 'position_change_proposal',
    title: 'ポジション変更の打診',
    description: '監督が戦術的な理由からポジション変更（コンバート）を提案してきた。「君ならきっとこなせる」と真剣な目で語りかけてきた。',
    choices: [
      { label: '受け入れて新しいプレースタイルに挑む', effect: { passing: 4, defense: 3, shooting: -2, morale: 15 } },
      { label: '自分のポジションへのこだわりを貫く', effect: { shooting: 3, dribbling: 2, morale: -10 } },
    ],
    condition: (state: GameState) => state.ovr >= 60,
  },
  {
    id: 'overseas_short_training',
    title: 'オフシーズンの短期海外留学',
    description: 'オフシーズンを利用してヨーロッパの名門クラブの短期キャンプに自費参加できるチャンスが舞い込んだ。費用はかかるが得るものは大きそうだ。',
    choices: [
      { label: '大金を投じてヨーロッパの最先端を体感する', effect: { speed: 3, passing: 3, money: -150, morale: 20 } },
      { label: '国内で個人課題と体力強化に専念する', effect: { stamina: 4, dribbling: 2, morale: 10 } },
    ],
    condition: (state: GameState) =>
      state.currentLeague !== 'premier_league' &&
      state.currentLeague !== 'champions_league' &&
      state.money >= 150,
  },
  {
    id: 'younger_brother_joins',
    title: '弟の下部組織入団',
    description: '実の弟が自分の所属クラブのユースアカデミー入団テストに合格した。思わず胸が熱くなる。',
    choices: [
      { label: '祝いの席でプロの厳しさとメンタルについて熱く語る', effect: { morale: 20, money: -30, stamina: 2 } },
      { label: '負担をかけないようにそっと見守る', effect: { morale: 15, passing: 2 } },
    ],
    condition: (state: GameState) => state.age >= 22,
  },
  {
    id: 'rival_club_scout',
    title: 'ライバルチームからの接触',
    description: '地域ダービーのライバルクラブのスカウトが極秘で破格の条件を提示しながら移籍を打診してきた。',
    choices: [
      { label: '条件だけでも確認するため極秘ミーティングに応じる', effect: { money: 200, morale: -10, defense: -2 } },
      { label: 'クラブのエンブレムを指差して即座に断る', effect: { morale: 30, shooting: 2, passing: 2 } },
    ],
    condition: (state: GameState) => state.ovr >= 70,
  },
  {
    id: 'penalty_controversy',
    title: '判定を巡る大論争',
    description: '前半のPKシーンが「シミュレーション疑惑」としてSNSとメディアで炎上。チームは勝利したが試合後の記者会見が荒れ模様だ。',
    choices: [
      { label: '「正当なプレーだった」と最後まで主張する', effect: { morale: 10, dribbling: 2 } },
      { label: '沈黙を守り次の試合のプレーで証明する', effect: { shooting: 3, stamina: 2, morale: -5 } },
    ],
  },
  {
    id: 'vip_guest_in_stands',
    title: 'スタンドの特別ゲスト',
    description: 'VIP席に世界的映画俳優と代表監督が観戦に来ているという情報がロッカールームに伝わった。注目される絶好のチャンスだ。',
    choices: [
      { label: '主役になるべく果敢にシュートを狙い続ける', effect: { shooting: 3, dribbling: 2, morale: 15 } },
      { label: '意識せずチーム戦術を徹底して実行する', effect: { passing: 3, defense: 2, morale: 10 } },
    ],
    condition: (state: GameState) =>
      state.currentLeague === 'premier_league' ||
      state.currentLeague === 'champions_league',
  },
  {
    id: 'club_financial_crisis',
    title: 'クラブの深刻な財政難',
    description: 'メインスポンサーの撤退でクラブの経営難が表面化。給与遅延や遠征費削減の噂がロッカールームに広がっている。',
    choices: [
      { label: '減俸を受け入れてでもクラブと共に戦う', effect: { money: -100, morale: 30, defense: 2 } },
      { label: 'エージェントに早期移籍を打診する', effect: { money: 100, morale: -15 } },
    ],
  },
  {
    id: 'final_day_drama',
    title: '最終節のドラマ',
    description: '勝てば昇格（または残留）、敗れれば全てを失うシーズン最終節を前に、スタジアム全体が異様な緊張感に包まれている。',
    choices: [
      { label: 'ロッカールームの中心でチームを奮い立たせる', effect: { morale: 30, stamina: 2, defense: 3 } },
      { label: '極限まで集中力を研ぎ澄ませて個人技を磨く', effect: { shooting: 3, speed: 2, morale: 20 } },
    ],
    condition: (state: GameState) => state.currentWeek >= 36,
  },
  {
    id: 'offseason_vacation',
    title: 'オフシーズンの休暇',
    description: '激闘のシーズンを終え、南国リゾートでの休暇を計画した。ゆっくり休むか、ここでも鍛えるか。',
    choices: [
      { label: 'リゾートで何もせず心身ともに完全回復する', effect: { morale: 35, money: -80, stamina: -1, speed: -1 } },
      { label: '毎朝ビーチランを欠かさず体を絞り続ける', effect: { stamina: 4, speed: 3, morale: 15, money: -50 } },
    ],
    condition: (state: GameState) => state.fatigue >= 60,
  },
  {
    id: 'haunted_hotel',
    title: '遠征先ホテルの怪奇現象',
    description: '遠征前夜、古びたホテルでルームメイトが「幽霊が出た」と騒ぎ出した。明日の試合前日なのに眠れそうもない雰囲気だ。',
    choices: [
      { label: '夜通し付き合って仲間の不安を和らげてあげる', effect: { morale: 15, passing: 2, stamina: -3 } },
      { label: 'イヤホンをして強引に睡眠を優先する', effect: { stamina: 2, morale: -5 } },
    ],
  },
  {
    id: 'childhood_mentor_returns',
    title: '少年時代の恩師との再会',
    description: '初めてサッカーを教えてくれた少年サッカークラブの恩師が、今日の試合をスタンドで観戦しに来てくれた。',
    choices: [
      { label: 'あの頃の泥まみれの闘志を思い出して初心に返る', effect: { stamina: 3, defense: 2, morale: 30 } },
      { label: '成長したプロの洗練されたテクニックを披露する', effect: { dribbling: 3, shooting: 2, morale: 20 } },
    ],
  },
  {
    id: 'injury_tactical_awakening',
    title: '怪我の功名：戦術分析への目覚め',
    description: '長期離脱中、スタンドからチームを観察し続けるうちに、これまで気づかなかった戦術的な視野が開けてきた。',
    choices: [
      { label: '分析リポートを作成してコーチングスタッフに提出する', effect: { passing: 5, morale: 20 } },
      { label: '復帰後のプレーに活かすイメージトレーニングに集中する', effect: { shooting: 3, dribbling: 2, morale: 15 } },
    ],
    condition: (state: GameState) => state.injury > 0,
  },
  {
    id: 'veteran_retirement',
    title: '盟友の突然の引退発表',
    description: 'チームを長年支えたベテランが持病の悪化を理由に突然の引退を発表した。ロッカールームに重い沈黙が流れた。',
    choices: [
      { label: '「最後は笑顔で送り出す」と誓い次の試合の勝利を捧げる', effect: { morale: 25, shooting: 3, stamina: 2 } },
      { label: '大きなショックを受けて少しの間、喪失感から抜け出せない', effect: { morale: -15, passing: -2 } },
    ],
  },
  {
    id: 'retirement_crisis',
    title: 'ベテランの危機：構想外の通告',
    description: '衰えと若手の台頭を理由に、クラブから来季の再契約見送り方針を非公式に伝えられた。プロキャリアの終わりが近づいている。',
    choices: [
      { label: '「まだ終わらない」と若手以上の猛練習で意地を見せる', effect: { stamina: 4, defense: 3, morale: 20 } },
      { label: '現実を受け入れてセカンドキャリアの準備を始める', effect: { money: 50, morale: -20, shooting: -2 } },
    ],
    condition: (state: GameState) => state.age >= 32 && state.ovr <= 60,
  },
  {
    id: 'late_night_tv',
    title: '深夜バラエティ番組への出演',
    description: '人気の深夜バラエティ番組からゲスト出演のオファーが届いた。収録は深夜まで続く予定だが露出とファン拡大のチャンスだ。',
    choices: [
      { label: 'トークで魅力を発揮してファン層を広げ出演料を稼ぐ', effect: { money: 120, morale: 15, stamina: -3 } },
      { label: '「本業はサッカー」と断り自宅でゆっくり休む', effect: { stamina: 3, speed: 2, morale: 10 } },
    ],
  },
  {
    id: 'jersey_exchange_snub',
    title: 'ユニフォーム交換の拒否騒動',
    description: '試合終了後、相手チームの世界的スターにユニフォーム交換を申し出たが無言で無視された。その瞬間がSNSで世界中に広まってしまった。',
    choices: [
      { label: '屈辱をバネに「次は実力で圧倒する」と決意する', effect: { shooting: 4, dribbling: 3, morale: 20 } },
      { label: 'プライドを傷つけられて気持ちの整理がつかない', effect: { morale: -20, speed: -2 } },
    ],
    condition: (state: GameState) => state.currentLeague === 'champions_league',
  },
  {
    id: 'malicious_rumor',
    title: '悪質なネットデマへの対応',
    description: 'ネット上で自分のプライバシーに関する全く根拠のないデマが拡散し始めた。放置すれば燃え広がりそうだ。',
    choices: [
      { label: '弁護士を立てて法的措置で徹底的に対抗する', effect: { money: -80, morale: 15, defense: 2 } },
      { label: '相手にする価値もないと完全無視して練習に打ち込む', effect: { passing: 3, morale: -10 } },
    ],
  },
  {
    id: 'snow_postponement',
    title: '大雪による試合延期',
    description: '記録的な大雪で週末の試合が中止に。来週は過密日程が確定しており、このタイミングをどう活かすかが問われる。',
    choices: [
      { label: 'マッサージと睡眠で徹底的に疲労回復に充てる', effect: { stamina: 4, morale: 15 } },
      { label: '室内トレーニングの強度を上げてフィジカルを底上げする', effect: { speed: 3, defense: 2, morale: -5 } },
    ],
  },
  {
    id: 'esports_tournament',
    title: 'クラブ主催のゲーム大会',
    description: 'ファン感謝イベントとしてクラブが開催したサッカーゲームのe-sports大会に選手代表として出場することになった。',
    choices: [
      { label: 'ゲーマーの自尊心を懸けて圧倒的な操作で優勝を狙う', effect: { morale: 20, passing: 2, money: 50 } },
      { label: '勝敗より来場したサポーターとの交流とファンサービスに集中する', effect: { morale: 30, money: 30 } },
    ],
  },
  {
    id: 'signature_boots',
    title: '特注スパイクの開発協力',
    description: '契約スポーツブランドから、自分の足型とプレースタイルに完全特化したシグネチャースパイクの開発協力を依頼された。',
    choices: [
      { label: '細部までフィードバックして機能性を極限まで高める', effect: { dribbling: 3, speed: 3, morale: 15 } },
      { label: 'デザイン性と大衆受けを優先して販売ロイヤリティを狙う', effect: { money: 250, morale: 10, dribbling: 1 } },
    ],
    condition: (state: GameState) => state.ovr >= 75,
  },
  // キャバクラ・遊興系イベント

  {
    id: 'cabaret_invite',
    title: 'チームメイトから夜の誘い',
    description: 'チームメイトが「今夜一緒にどうだ？」と誘ってきた。新しい店ができたらしい。',
    choices: [
      { label: '行く（気分転換になりそう）', effect: { morale: 15, fatigue: -10, conductScore: -10, cabaretVisit: true } },
      { label: '断って早めに休む', effect: { stamina: 3, morale: 5 } },
    ],
  },
  {
    id: 'cabaret_hooked',
    title: '常連になりつつある夜',
    description: 'いつの間にかその店の常連になっていた。指名嬢ができ、毎週行くのが習慣になりつつある。',
    choices: [
      { label: 'このまま通い続ける', effect: { morale: 20, fatigue: -15, conductScore: -20, stamina: -5, cabaretVisit: true } },
      { label: '距離を置くことにする', effect: { morale: -10, stamina: 2 } },
    ],
    condition: (s: GameState) => (s.cabaretCount ?? 0) >= 5,
  },
  {
    id: 'cabaret_debt_warning',
    title: '使いすぎ警告',
    description: 'カードの明細を見て青ざめた。先月だけで夜の出費が桁違いだ。エージェントから「このままでは…」と警告が来た。',
    choices: [
      { label: '「問題ない」と言い聞かせ続ける', effect: { morale: 5, conductScore: -15, stamina: -8 } },
      { label: '少し自制することにした', effect: { morale: -5, conductScore: 10 } },
    ],
    condition: (s: GameState) => (s.cabaretCount ?? 0) >= 15,
  },
  {
    id: 'cabaret_scandal_risk',
    title: '週刊誌記者の影',
    description: '店の外で見慣れない男がカメラを持っていた。スキャンダル記事にされる可能性がある。',
    choices: [
      { label: 'もう通うのをやめる', effect: { morale: -10, conductScore: 15, stamina: 3 } },
      { label: '気にせず続ける（今さら変えられない）', effect: { morale: 10, conductScore: -20, stamina: -10, cabaretVisit: true } },
    ],
    condition: (s: GameState) => (s.cabaretCount ?? 0) >= 25,
  },
  {
    id: 'cabaret_health_collapse',
    title: '体が限界を訴えている',
    description: '夜遊びが続き、練習中に倒れそうになった。医師から「このままでは選手生命が危ない」と告げられた。',
    choices: [
      { label: '真剣に考え直す', effect: { morale: -15, conductScore: 20, stamina: 10, speed: 5 } },
      { label: '「まだ大丈夫」と無視する', effect: { morale: 10, stamina: -20, speed: -10, conductScore: -25 } },
    ],
    condition: (s: GameState) => (s.cabaretPenaltyLevel ?? 0) >= 3,
  },

  {
    id: 'hometown_ambassador',
    title: '生まれ故郷の観光親善大使',
    description: '選手としての知名度が上がり、出身地の自治体から地域PRの親善大使就任を依頼された。地元への恩返しができる機会だ。',
    choices: [
      { label: '快諾してオフシーズンに故郷へ帰り地域イベントに参加する', effect: { morale: 20, money: 60, stamina: -2 } },
      { label: '今はキャリアに集中するときと丁重に断りグラウンドへ向かう', effect: { shooting: 2, passing: 2, morale: 10 } },
    ],
  },
];

export function getRandomEvent(state: GameState): GameEvent | null {
  const eligible = GAME_EVENTS.filter(event => {
    if (event.condition) return event.condition(state);
    return true;
  });
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}
