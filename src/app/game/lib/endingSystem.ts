import type { GameState } from '../types/game';

export type EndingCategory =
  | 'legend'
  | 'asset'
  | 'coach'
  | 'average'
  | 'ruin'
  | 'special';

export type EndingRarity = 'legendary' | 'good' | 'normal' | 'bad' | 'catastrophe';

export interface GameEnding {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  story: string;
  category: EndingCategory;
  rarity: EndingRarity;
  priority: number;
  condition: (s: GameState) => boolean;
}

const hasBallonDor  = (s: GameState) => s.awards.includes('バロンドール');
const hasCLTrophy   = (s: GameState) => s.trophies.some(t => t.includes('チャンピオンズリーグ'));
const inCL          = (s: GameState) => s.currentLeague === 'champions_league';
const inPL          = (s: GameState) => s.currentLeague === 'premier_league';
const inTopLeague   = (s: GameState) => inCL(s) || inPL(s);
const conduct       = (s: GameState) => s.conductScore ?? 100;
const cabaret       = (s: GameState) => s.cabaretCount ?? 0;
const penalty       = (s: GameState) => s.cabaretPenaltyLevel ?? 0;
const reCount       = (s: GameState) => (s.realEstate ?? []).length;
const carCount      = (s: GameState) => (s.vehicles ?? []).length;

export const ENDINGS: GameEnding[] = [

  // 強制終了 (即エンディング)
  {
    id: 'drug_arrest',
    emoji: '🚨',
    title: '麻薬摘発・永久追放',
    subtitle: 'キャリア強制終了',
    story: 'キャバクラ通いが深みにはまり、ついに禁断の一線を越えてしまった。違法薬物の使用が発覚し、翌朝には警察が自宅に。チームは即座に解雇を通告し、サッカー協会は永久資格停止処分を下した。夢のような日々は一瞬で崩れ去り、名前はスキャンダルの代名詞となった。',
    category: 'ruin',
    rarity: 'catastrophe',
    priority: 9999,
    condition: s => s.isDrugEvent === true,
  },

  // レジェンドルート (5種)
  {
    id: 'goat_ending',
    emoji: '🐐',
    title: '史上最高の選手',
    subtitle: 'GOAT / Greatest of All Time',
    story: 'バロンドールを複数回受賞し、チャンピオンズリーグを制覇。最終OVR99の神域に達したあなたは、メッシやロナウドの名と並び称されるようになった。引退セレモニーはスタジアムを埋め尽くしたファンの涙で終わり、ユニフォームは即座に永久欠番となった。',
    category: 'legend',
    rarity: 'legendary',
    priority: 950,
    condition: s => hasBallonDor(s) && hasCLTrophy(s) && s.ovr >= 97 && s.totalGoals >= 200,
  },
  {
    id: 'ballon_dor_legend',
    emoji: '🏅',
    title: 'バロンドール受賞の伝説',
    subtitle: '世界が認めた最高峰',
    story: '夢のバロンドールをついに手にした。壇上でトロフィーを掲げた瞬間、スタジアム全体が揺れた。現役最後の試合はスタンディングオベーションの中幕を閉じ、その名は世界中のサッカー教科書に刻まれることとなった。',
    category: 'legend',
    rarity: 'legendary',
    priority: 940,
    condition: s => hasBallonDor(s) && s.ovr >= 95 && inTopLeague(s),
  },
  {
    id: 'cl_champion_hero',
    emoji: '👑',
    title: 'チャンピオンズリーグの英雄',
    subtitle: '欧州制覇の記憶',
    story: 'ビッグイヤーを掲げた夜を誰も忘れない。決勝のゴールはいつまでも語り継がれ、CLファイナルMVPとして名を刻んだ。帰国後は国家英雄として迎えられ、引退後も「その試合」の映像は繰り返し流され続けた。',
    category: 'legend',
    rarity: 'legendary',
    priority: 930,
    condition: s => hasCLTrophy(s) && s.ovr >= 90 && inTopLeague(s),
  },
  {
    id: 'one_club_legend',
    emoji: '❤️',
    title: 'ワンクラブマンの伝説',
    subtitle: '生涯一筋の誓い',
    story: 'より高額のオファーを何度も断り、愛するクラブだけに人生を捧げた。スタジアムには銅像が建ち、クラブ史上最多得点記録は永遠に君の名の下に刻まれた。「あの選手がいなければこのクラブはなかった」と誰もが言う。',
    category: 'legend',
    rarity: 'legendary',
    priority: 920,
    condition: s => s.ovr >= 80 && s.currentSeason >= 10 && s.totalGoals >= 150 && conduct(s) >= 70,
  },
  {
    id: 'eternal_warrior',
    emoji: '⚔️',
    title: '不滅の戦士・45歳の伝説',
    subtitle: '時間さえも超えた肉体',
    story: '35歳で引退と言われたが、君は笑って首を振った。40歳でもリーグ最多得点争いに絡み、45歳でついにスパイクを脱いだ。「あの年齢でなぜ動けるのか」という問いに、君はただ「サッカーが好きだから」と答えた。',
    category: 'legend',
    rarity: 'legendary',
    priority: 910,
    condition: s => s.age >= 43 && s.ovr >= 70 && conduct(s) >= 75 && cabaret(s) <= 10,
  },

  // 資産家/ビジネスルート (5種)
  {
    id: 'property_tycoon',
    emoji: '🏠',
    title: '不動産王への転身',
    subtitle: '第二の人生は不動産帝国',
    story: '引退後は蓄えた富と知名度を武器に不動産業界に参入。都心に複数棟のマンションを保有し、年間収入は現役時代を超えた。「サッカーで稼いだお金の最善の使い方を考えたら、不動産しかなかった」とインタビューで語った。',
    category: 'asset',
    rarity: 'good',
    priority: 700,
    condition: s => reCount(s) >= 3 && s.money >= 50000 && conduct(s) >= 60,
  },
  {
    id: 'supercar_collector',
    emoji: '🏎️',
    title: 'スーパーカーコレクター',
    subtitle: '夢のガレージと第二の人生',
    story: '引退会見より、ガレージの公開動画の方が話題になった。10台を超えるスーパーカーが並ぶ映像はSNSで1000万再生を超え、自動車メーカーからコラボオファーが殺到。「一番速いのはどれか」という問いに君は全て乗り比べて答えた。',
    category: 'asset',
    rarity: 'good',
    priority: 690,
    condition: s => carCount(s) >= 3 && s.money >= 30000 && conduct(s) >= 50,
  },
  {
    id: 'sports_agent',
    emoji: '🤝',
    title: '敏腕エージェントへの転身',
    subtitle: '選手を育てる第二の人生',
    story: '現役時代のコネクションと知識を活かし、引退後はスポーツエージェントとして業界に入った。自ら発掘した若手が数年後にW杯で活躍し、「あのエージェントに任せれば大丈夫」と言われるようになった。',
    category: 'asset',
    rarity: 'good',
    priority: 680,
    condition: s => s.ovr >= 70 && conduct(s) >= 75 && s.totalAssists >= 80 && s.money >= 10000,
  },
  {
    id: 'media_star',
    emoji: '📺',
    title: 'テレビタレント・メディア王',
    subtitle: '画面の中の新たなスター',
    story: '引退後、バラエティ番組でのキャラクターが爆発的にウケた。スポーツ解説にとどまらず、CM出演やドラマ主演まで舞い込み、現役時代より忙しい毎日になった。「サッカーを辞めたのではなく、もっと大きいステージに移っただけだ」と本人は笑う。',
    category: 'asset',
    rarity: 'good',
    priority: 670,
    condition: s => (s.fans ?? 0) >= 100000 && s.money >= 20000 && conduct(s) >= 65,
  },
  {
    id: 'wealthy_retirement',
    emoji: '💰',
    title: '裕福な紳士引退',
    subtitle: '悠々自適の余生',
    story: '現役時代の収入を堅実に積み上げ、豊かな老後を手に入れた。海辺の豪邸で家族と過ごし、時折サッカー教室で子どもたちを教える。「人生で後悔はない」という言葉は、本当に心の底から出た言葉だった。',
    category: 'asset',
    rarity: 'good',
    priority: 660,
    condition: s => s.money >= 80000 && conduct(s) >= 70 && reCount(s) >= 2,
  },

  // 監督/指導者ルート (5種)
  {
    id: 'legendary_manager',
    emoji: '📋',
    title: '名将への転身',
    subtitle: '第二の伝説が始まる',
    story: '引退後すぐに指導者ライセンスを取得し、母国クラブの監督に就任。現役時代の知見と情熱で若手を育て上げ、5年後には代表監督のオファーが届いた。「選手として学んだことを全てピッチに返したい」という言葉通りの軌跡だった。',
    category: 'coach',
    rarity: 'good',
    priority: 750,
    condition: s => s.ovr >= 85 && conduct(s) >= 80 && s.currentSeason >= 8 && s.totalAssists >= 100,
  },
  {
    id: 'national_coach',
    emoji: '🌐',
    title: '代表監督就任',
    subtitle: '国を背負う新たな重責',
    story: '現役時代の実績と人柄が評価され、国際サッカー連盟から代表監督就任のオファーが届いた。一流選手としての経験をベースにした戦術は革新的で、「新時代のサッカーを作る男」として世界から注目されている。',
    category: 'coach',
    rarity: 'good',
    priority: 740,
    condition: s => s.ovr >= 80 && conduct(s) >= 80 && (s.seasonAwards?.length ?? 0) >= 5,
  },
  {
    id: 'youth_coach',
    emoji: '🌱',
    title: 'ユースアカデミーの名伯楽',
    subtitle: '次世代を育てる喜び',
    story: '派手さはないが、この国で最も大切な仕事を選んだ。ユースアカデミーのコーチとして、泥だらけになりながら子どもたちとボールを追う日々。10年後、自分が育てた選手がA代表で活躍したとき、これ以上の喜びはないと確信した。',
    category: 'coach',
    rarity: 'good',
    priority: 730,
    condition: s => conduct(s) >= 75 && s.ovr >= 65 && cabaret(s) <= 5,
  },
  {
    id: 'tactics_pundit',
    emoji: '🎙️',
    title: 'カリスマ解説者・戦術家',
    subtitle: 'テレビの向こうの戦術革命',
    story: 'スタジオでの解説は毎回話題になった。現役時代に積んだ経験に裏打ちされた分析は鋭く、「あの人の解説があると試合が10倍面白くなる」とファンが言う。書いた戦術本はベストセラーになり、サッカー界の知の巨人として君臨する。',
    category: 'coach',
    rarity: 'good',
    priority: 720,
    condition: s => (s.fans ?? 0) >= 50000 && conduct(s) >= 70 && s.ovr >= 75,
  },
  {
    id: 'club_director',
    emoji: '🏢',
    title: 'クラブ経営者・スポーツディレクター',
    subtitle: 'フロントから描く未来',
    story: '現役時代からクラブ経営に興味を持ち続けた夢がついに実現した。スポーツディレクターとして補強戦略を練り、クラブを数年でリーグ優勝へと導いた。「ピッチの外でもサッカーに関わり続けることができる」と穏やかに微笑んだ。',
    category: 'coach',
    rarity: 'good',
    priority: 710,
    condition: s => s.money >= 30000 && conduct(s) >= 70 && s.ovr >= 70 && s.currentSeason >= 7,
  },

  // 凡戦/低迷ルート (5種)
  {
    id: 'journeyman',
    emoji: '🗺️',
    title: 'ジャーニーマン',
    subtitle: 'リーグを旅した男',
    story: '10チーム以上を渡り歩いたキャリアは波乱万丈だった。どのチームでも確実に仕事をこなし、ロッカールームを明るくする男として重宝された。派手なタイトルはないが、「あいつがいると雰囲気が変わる」と言われた選手として記憶される。',
    category: 'average',
    rarity: 'normal',
    priority: 400,
    condition: s => s.currentSeason >= 12 && s.ovr < 70 && s.totalGoals >= 30,
  },
  {
    id: 'injury_plagued',
    emoji: '🩹',
    title: '怪我との闘い',
    subtitle: '才能は本物だったが...',
    story: '怪我さえなければ、と誰もが思った。輝かしい才能を持ちながら、怪我が続き30代を迎える前に引退を決意した。後輩たちへ「体を大切に」と伝え続けることが、今の自分の使命だと考えている。',
    category: 'average',
    rarity: 'normal',
    priority: 390,
    condition: s => s.age <= 31 && s.injury >= 3,
  },
  {
    id: 'hometown_hero',
    emoji: '🏘️',
    title: 'ふるさとのヒーロー',
    subtitle: '地元を愛した男',
    story: '海外移籍や上位リーグへの誘いを断り、地元クラブで現役を全うした。「ここで育ったから、ここで終わりたかった」。引退セレモニーには幼稚園から付き合いのある幼馴染みが客席を埋め、共に泣いた。',
    category: 'average',
    rarity: 'normal',
    priority: 380,
    condition: s => s.currentLeague === 'regional' || s.currentLeague === 'j3',
  },
  {
    id: 'late_bloomer',
    emoji: '🌸',
    title: '大器晩成',
    subtitle: '遅咲きのスター',
    story: '20代は無名だったが、30代に入ってから才能が開花した。欧州移籍は年齢的に遅すぎると言われたが、それでも結果を出し続けた。「諦めなければ花は開く」という生き様は、多くの若者を勇気づけた。',
    category: 'average',
    rarity: 'normal',
    priority: 370,
    condition: s => s.age >= 33 && inTopLeague(s) && s.currentSeason >= 3,
  },
  {
    id: 'quiet_professional',
    emoji: '📝',
    title: '静かなプロフェッショナル',
    subtitle: '堅実な現役生活',
    story: '華やかさはなかったが、20年近くプロとして食べてきた。毎試合120%の力を出し続け、チームメイトから最も信頼される選手だった。「目立たないことが自分のスタイルだ」と引退会見で笑った。',
    category: 'average',
    rarity: 'normal',
    priority: 360,
    condition: () => true, // フォールバック
  },

  // 遊興/破滅ルート (10種)
  {
    id: 'alcoholism_ending',
    emoji: '🍶',
    title: 'アルコール依存症による解雇',
    subtitle: '夜の街が人生を狂わせた',
    story: '最初は週末だけのはずだった。気づけば毎晩飲まずにいられなくなり、練習に遅刻するようになった。チームは契約解除し、どこも受け入れてくれなくなった。依存症の治療を経て、今は「自分と同じ道を歩ませたくない」と講演活動を続けている。',
    category: 'ruin',
    rarity: 'bad',
    priority: 850,
    condition: s => cabaret(s) >= 100 && conduct(s) < 30,
  },
  {
    id: 'bankruptcy_ending',
    emoji: '💸',
    title: '破産・全財産喪失',
    subtitle: '遊び尽くして残ったのは借金だけ',
    story: '億単位の年俸も、キャバクラと贅沢三昧で消えていった。引退後に残ったのは多額の負債のみ。豪邸もスーパーカーも差し押さえられ、かつてのチームメイトに借金を申し込む日々が続いた。お金の使い方を学ばなかった代償は、あまりにも大きかった。',
    category: 'ruin',
    rarity: 'bad',
    priority: 840,
    condition: s => s.money < 0 && cabaret(s) >= 60,
  },
  {
    id: 'cabaret_debt_hell',
    emoji: '⛓️',
    title: 'キャバクラ借金地獄',
    subtitle: '夜の街の罠にはまった男',
    story: '「太客」として店の指名を総取りし続けた結果、気づけばカードの限度額を超えていた。消費者金融に手を出し、利子は雪だるま式に膨らんだ。チームには秘密にしていたが、やがてバレて解雇。人生最大の失敗は、あの赤い扉を開けたことだったかもしれない。',
    category: 'ruin',
    rarity: 'bad',
    priority: 830,
    condition: s => cabaret(s) >= 50 && s.money < 5000 && penalty(s) >= 3,
  },
  {
    id: 'scandal_exile',
    emoji: '📰',
    title: 'スキャンダル追放',
    subtitle: '週刊誌が全てをさらけ出した',
    story: '夜の街での振る舞いが週刊誌の記者に撮られていた。記事が出た翌日、チームからの電話は「今すぐ来い」だった。記者会見も開けないほどのスキャンダルに、家族も離れていった。名声は一晩で消え去った。',
    category: 'ruin',
    rarity: 'bad',
    priority: 820,
    condition: s => penalty(s) >= 5 && conduct(s) < 20,
  },
  {
    id: 'fallen_star',
    emoji: '🌠',
    title: '転落した星',
    subtitle: 'かつての輝きはどこへ',
    story: 'OVR90を超えていた頃、誰もが次世代の伝説だと信じていた。だが夜の街への依存が深まり、スタッツは急落した。契約は打ち切られ、下位リーグを転々とした後、30代前半でひっそりと引退。あの輝きはいったい何だったのかと誰もが首を振った。',
    category: 'ruin',
    rarity: 'bad',
    priority: 810,
    condition: s => s.ovr < 65 && (s.seasonStartOvr ?? 0) >= 90 && penalty(s) >= 3,
  },
  {
    id: 'double_life',
    emoji: '🎭',
    title: '二重生活の崩壊',
    subtitle: '表と裏の顔が暴かれた夜',
    story: 'ピッチ上では誰よりも輝いていた。しかし夜になると別人になっていた。その二重生活が発覚したのは、SNSにアップされた動画がきっかけだった。「あの人がそんなことをするなんて」という落胆の声が日本中に響いた。',
    category: 'ruin',
    rarity: 'bad',
    priority: 800,
    condition: s => s.ovr >= 80 && conduct(s) < 25 && cabaret(s) >= 40,
  },
  {
    id: 'cabaret_obsession',
    emoji: '🍷',
    title: 'キャバクラ依存症',
    subtitle: 'ネオンの灯りに魂を売った男',
    story: '「今夜だけ」が積み重なり、100回を超えた頃には夜に行かないと落ち着かなくなっていた。練習より夜の街が恋しくなり、試合中も集中できなくなった。チームメイトは気づいていたが、誰も止めることができなかった。',
    category: 'ruin',
    rarity: 'bad',
    priority: 790,
    condition: s => cabaret(s) >= 80 && penalty(s) >= 4,
  },
  {
    id: 'early_career_ruin',
    emoji: '💔',
    title: '若くして終わった夢',
    subtitle: '才能を自ら潰した青春',
    story: '20代前半、若さと無敵感が判断を狂わせた。夜遊びとスキャンダルが重なり、28歳を迎える前にどのチームからも声がかからなくなった。あの頃の自分に会えるなら、ただ一言「サッカーだけを信じろ」と伝えたい。',
    category: 'ruin',
    rarity: 'bad',
    priority: 780,
    condition: s => s.age <= 28 && conduct(s) < 30 && cabaret(s) >= 20,
  },
  {
    id: 'wasted_talent',
    emoji: '🕯️',
    title: '消えた才能',
    subtitle: 'あと一歩で伝説になれた男',
    story: '全盛期のプレーを知る人は今でも首を振る。「あいつが真面目にやっていたら、バロンドールもあり得た」と。しかし本人にはわからなかった。欲しいものは手に入れ続けたが、一番大切なものを失っていたことに気づいたのは、全てが終わった後だった。',
    category: 'ruin',
    rarity: 'bad',
    priority: 770,
    condition: s => (s.seasonStartOvr ?? s.ovr) >= 80 && s.ovr < 60 && penalty(s) >= 2,
  },
  {
    id: 'young_broke',
    emoji: '🏚️',
    title: '若くして無一文',
    subtitle: 'お金は飛ぶように消えた',
    story: '若い頃に稼いだ億単位の報酬は、気づけば何も残っていなかった。スーパーカーは売り払い、豪邸も手放した。夜の街で散財し続けた青春への後悔は深いが、今は地元のサッカー教室のボランティアコーチとして静かに生きている。',
    category: 'ruin',
    rarity: 'bad',
    priority: 760,
    condition: s => s.money < 1000 && s.age <= 32 && cabaret(s) >= 30,
  },

  // スペシャルエンディング (5種)
  {
    id: 'perfect_gentleman',
    emoji: '🎩',
    title: '完璧な紳士',
    subtitle: '夜の街に一切踏み込まなかった男',
    story: '現役20年間、夜の誘惑に一度も負けなかった。早寝早起き、節酒、家族優先。引退会見では「後悔は何もない」という言葉が静かに、しかし確かに響いた。その生き様は若い選手たちの手本として今も語り継がれている。',
    category: 'special',
    rarity: 'legendary',
    priority: 500,
    condition: s => cabaret(s) === 0 && s.ovr >= 70 && conduct(s) >= 95,
  },
  {
    id: 'tragic_hero',
    emoji: '⚡',
    title: '悲劇のヒーロー',
    subtitle: '怪我が奪った伝説の続き',
    story: 'OVR90を超え、バロンドール候補筆頭と言われていた。しかしその日の試合で大怪我を負い、二度とプロとしてのプレーができなくなった。引退式には世界中からメッセージが届き、ファンは「あなたの夢の続きを語り続ける」と誓った。',
    category: 'special',
    rarity: 'legendary',
    priority: 490,
    condition: s => s.ovr >= 88 && s.age <= 30 && s.injury >= 4,
  },
  {
    id: 'comeback_king',
    emoji: '🔥',
    title: 'カムバックキング',
    subtitle: '何度倒れても立ち上がった男',
    story: '引退寸前と言われても、そのたびに這い上がってきた。スランプ、怪我、スキャンダル、何もかもを乗り越えてきた軌跡はドラマより激しかった。最後の試合でゴールを決めたとき、スタジアムは震えた。',
    category: 'special',
    rarity: 'good',
    priority: 480,
    condition: s => s.currentSeason >= 10 && s.totalGoals >= 100 && conduct(s) >= 50,
  },
  {
    id: 'world_record_scorer',
    emoji: '⚽',
    title: 'ゴールマシン・世界記録保持者',
    subtitle: '数字が全てを語る',
    story: '300ゴールを超えた瞬間、スタジアムの全観客が立ち上がった。記録は更新され続け、最終的に歴代最多得点記録として名前が刻まれた。「ゴールを決める喜びは、何万回経験しても変わらない」という言葉は名言として残った。',
    category: 'special',
    rarity: 'legendary',
    priority: 470,
    condition: s => s.totalGoals >= 300,
  },
  {
    id: 'role_model',
    emoji: '👨‍👧',
    title: 'ロールモデル引退',
    subtitle: '次世代への光',
    story: '賞やトロフィーより、子どもたちの笑顔が宝物だった。チャリティ活動、ユース支援、地域貢献。引退後に「あの人のようになりたい」と言った子が何百人もプロになった。これ以上の遺産はない。',
    category: 'special',
    rarity: 'good',
    priority: 460,
    condition: s => conduct(s) >= 85 && s.ovr >= 60 && (s.fans ?? 0) >= 10000,
  },
];

// エンディング判定

export function determineEnding(state: GameState): GameEnding {
  const sorted = [...ENDINGS].sort((a, b) => b.priority - a.priority);
  return sorted.find(e => e.condition(state)) ?? ENDINGS[ENDINGS.length - 1];
}

// エンディングカテゴリ表示

export const ENDING_CATEGORY_LABEL: Record<EndingCategory, string> = {
  legend:  'レジェンド',
  asset:   '資産家/実業家',
  coach:   '指導者/監督',
  average: 'プロの軌跡',
  ruin:    '破滅/警告',
  special: 'スペシャル',
};

export const ENDING_RARITY_COLOR: Record<EndingRarity, string> = {
  legendary:   '#eab308',
  good:        '#22c55e',
  normal:      '#94a3b8',
  bad:         '#ef4444',
  catastrophe: '#7c3aed',
};

export const ENDING_RARITY_LABEL: Record<EndingRarity, string> = {
  legendary:   'レジェンド',
  good:        'グッドエンド',
  normal:      'ノーマルエンド',
  bad:         'バッドエンド',
  catastrophe: '強制終了',
};
