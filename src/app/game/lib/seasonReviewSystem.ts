import type { GameState } from '../types/game';

export type ReviewSentiment = 'praise' | 'criticism' | 'neutral' | 'mixed';
export type ReviewGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface SeasonReviewEntry {
  reviewerName: string;
  reviewerRole: string;
  reviewerEmoji: string;
  comment: string;
  sentiment: ReviewSentiment;
  grade: ReviewGrade;
}

// ゴール基準（リーグ別「平均的なゴール数」）
const GOAL_BASELINE: Record<string, number> = {
  regional:         4,
  j3:               6,
  j2:               8,
  j1:               11,
  premier_league:   13,
  champions_league: 16,
};

// 総合グレード算出
function gradePerformance(
  goals: number,
  assists: number,
  rating: number,
  matches: number,
  league: string,
  position: string,
): ReviewGrade {
  const baseline  = GOAL_BASELINE[league] ?? 8;
  // GK/DF はゴール比重を下げてレーティング重視
  const goalMult = position === 'GK' ? 0.2 : position === 'DF' ? 0.35 : position === 'MF' ? 0.5 : 0.65;
  const goalRatio = (goals + assists * 0.5) / Math.max(baseline, 1);
  const ratingScore = rating / 10;
  const matchScore  = Math.min(matches / 28, 1.0);

  const score = goalRatio * goalMult + ratingScore * (1 - goalMult) * 0.7 + matchScore * 0.15;

  if (score >= 0.80) return 'S';
  if (score >= 0.65) return 'A';
  if (score >= 0.50) return 'B';
  if (score >= 0.35) return 'C';
  return 'D';
}

// ランダム選択
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// コメントテンプレート
// ${name}, ${goals}, ${assists}, ${rating}, ${matches}, ${age}, ${league} を置換

type Template = { text: string; sentiment: ReviewSentiment };

function tmpl(text: string, sentiment: ReviewSentiment): Template { return { text, sentiment }; }

// 監督 城戸敏雄
const MANAGER_COMMENTS: Record<ReviewGrade, Template[]> = {
  S: [
    tmpl('${name}、今シーズンは申し分なかった。${goals}ゴール${assists}アシスト、評価点${rating}――私が監督としてこれ以上何を求める？チームの宝だ。', 'praise'),
    tmpl('今シーズン限りで監督を辞めても悔いはないと思わせるほど、${name}のプレーは輝いていた。次は代表のユニフォームを着てほしい。', 'praise'),
    tmpl('毎試合ロッカールームで選手たちを鼓舞しているが、今シーズンの${name}こそが最大の鼓舞だった。圧倒的な結果を見せてくれた。', 'praise'),
  ],
  A: [
    tmpl('良いシーズンだった。${goals}ゴールは監督として満足している。ただ、あと2、3試合でもっと決め切れていれば、という場面が頭から離れない。', 'mixed'),
    tmpl('合格点だ。ただプロとして本音を言えば、${name}にはS評価を期待していた。技術はある。後は決断力だ。来季こそ見せてほしい。', 'mixed'),
    tmpl('評価点${rating}という数字は正直なところだ。良い仕事をした。でも、真に一流と呼ぶには、まだあと一歩踏み込む勇気が必要だ。', 'neutral'),
  ],
  B: [
    tmpl('平均的なシーズンだった。それ以上でも以下でもない。チームとして重要な局面で輝けなかったのが悔やまれる。来季の巻き返しを期待する。', 'neutral'),
    tmpl('若いんだから、もっとリスクを冒せ。守りに入った瞬間、成長は止まる。${rating}という評価点は現状維持のシーズンを表している。', 'criticism'),
    tmpl('可もなく不可もなし、というシーズンだった。チームの雰囲気作りには貢献してくれたが、個人としての爆発力が見えなかった。', 'neutral'),
  ],
  C: [
    tmpl('率直に言う。今シーズンの${name}は期待を大きく下回った。${goals}ゴール、評価点${rating}では話にならない。来季の序列に影響が出ると思え。', 'criticism'),
    tmpl('プロとして結果を出せなかったシーズンだ。理由は自分が一番わかっているはずだ。言い訳より行動で示してほしい。', 'criticism'),
    tmpl('チームが苦しい時期に頼りたかったが、${name}も苦しそうだった。それが監督として一番つらかった。来季こそ。', 'mixed'),
  ],
  D: [
    tmpl('これだけのポテンシャルを持ちながら、このパフォーマンスは受け入れられない。${matches}試合でこの内容では、プロとして何かが根本的にズレている。', 'criticism'),
    tmpl('長年この仕事をしているが、これほど消化不良なシーズンは久しぶりだ。今すぐ自分と向き合ってほしい。でなければ来季のチームにはいられない。', 'criticism'),
    tmpl('給料に見合った仕事をしているか、自問してほしい。${name}には本当のポテンシャルがある。だからこそ、このシーズンは悔しかった。', 'criticism'),
  ],
};

// スポーツ記者 田辺純一
const JOURNALIST_COMMENTS: Record<ReviewGrade, Template[]> = {
  S: [
    tmpl('今シーズンの${name}は別格だった。${goals}ゴール、評価点${rating}――リーグでも指折りの数字だ。バロンドール候補として名前を挙げるのは時期尚早ではない。', 'praise'),
    tmpl('取材歴20年で「本物」の選手を何人か見てきた。${name}は今シーズン、そのリストに名前を刻んだ。来年の活躍が今から楽しみだ。', 'praise'),
    tmpl('数字が全てではないが、今シーズンの${name}は数字も内容も圧倒的だった。スポーツ新聞の一面を飾るに相応しいシーズンだ。', 'praise'),
  ],
  A: [
    tmpl('安定したシーズンを送った。${goals}ゴール、アシスト${assists}は及第点以上だが、リーグのトップに並ぶには爆発力がもう一つ欲しかった。惜しい。', 'mixed'),
    tmpl('評価点${rating}は信頼できる選手の証明だ。ただ記者として正直に言えば、もっと驚かせてほしかった。来シーズンに期待する。', 'neutral'),
    tmpl('データ的には良いシーズン。ただし「話題になった」かと聞かれれば、それほどでもない。スターになるには爆発的なインパクトが必要だ。', 'neutral'),
  ],
  B: [
    tmpl('今シーズンの${name}について書く記事は難しかった。悪くはない。でもリーグ平均程度の存在感だ。このポテンシャルでそれは正直もったいない。', 'criticism'),
    tmpl('辛口で言わせてもらう。${name}という名前は記者の間でも期待されている。だからこそ、平均的なシーズンでは物足りない。', 'criticism'),
    tmpl('${rating}という評価点は「それなり」という意味だ。プロとして「それなり」で終わっていいのか、本人に問いたい。', 'neutral'),
  ],
  C: [
    tmpl('批判を覚悟で書く――今シーズンの${name}は消えていた。${goals}ゴール、評価点${rating}では、読者の期待に応えるコラムが書けない。', 'criticism'),
    tmpl('シーズンを通じて波があった。特に後半の失速は深刻だった。フィジカルか、メンタルか、それとも別の何かか。記者として気になる。', 'criticism'),
    tmpl('数字が全てを語っている。今シーズンの${name}は、正直なところリーグ内でもなかなか目立てなかった。来季の巻き返しに注目したい。', 'criticism'),
  ],
  D: [
    tmpl('記者人生で「期待と結果の乖離がここまで大きい選手」を取材するのは珍しい。何があったのか、オフシーズンに聞いてみたい。', 'criticism'),
    tmpl('今シーズンの${name}のニュースは、スキャンダルではなく成績の低調さの方が深刻だった。このままでは移籍先の噂だけが一面を飾ることになる。', 'criticism'),
    tmpl('辛辣すぎると言われてもいい。評価点${rating}、${goals}ゴールで${matches}試合。この事実をどう受け止めるか、本人の問題だ。', 'criticism'),
  ],
};

// ライバル選手
const RIVAL_COMMENTS: Record<ReviewGrade, Template[]> = {
  S: [
    tmpl('……認めたくないけど、今シーズンは完全にやられた。あのゴールは俺には決められない。来年は俺が上を行く。待ってろよ。', 'praise'),
    tmpl('悔しいけど本当のことを言う。今シーズンの${name}は本物だった。ライバルとしてモチベーションが上がったよ。来シーズンが楽しみだ。', 'praise'),
    tmpl('俺も頑張ったんだけどな。今シーズンは数字で負けた。でも来年は俺がスポットライトを奪う。それだけ言っておく。', 'mixed'),
  ],
  A: [
    tmpl('悪くないよ、正直。でも怖いかって言われたら、もうちょっとだな。来シーズンもっと意識させてくれよ。そっちの方が俺も燃えるから。', 'neutral'),
    tmpl('互角かな、今シーズンは。ただ俺は来シーズン本気を出すから。そっちも覚悟しておいてよ。', 'neutral'),
    tmpl('まあ頑張ってたよ。でも俺の目線では、まだどこかヌルい部分がある。本気の${name}と対戦したい。', 'neutral'),
  ],
  B: [
    tmpl('もっとやれると思ってたんだけど、拍子抜けした。あのポテンシャルでこれじゃ、ライバルとして張り合いがない。', 'criticism'),
    tmpl('今シーズンの${name}は存在感薄かったよ。正直に言うと、俺がもっと気にすべき相手はほかにいた。ちょっと失望した。', 'criticism'),
    tmpl('ライバルとして辛口で言う。今シーズンは普通だった。普通は一番まずいんだよ、プロにとっては。', 'criticism'),
  ],
  C: [
    tmpl('同じリーグで戦ってる立場から言う。今シーズンは正直、楽させてもらった。本来の実力はもっとあるはずなのに、どうしたんだろ。', 'criticism'),
    tmpl('悪く言いたくないけど……俺が対戦した中で、今シーズンの${name}は怖くなかった。本気はどこいった？', 'criticism'),
    tmpl('俺も言いたくないんだけどな。コンディションが悪そうだった。ピッチ外で何かある？', 'mixed'),
  ],
  D: [
    tmpl('あのさ、これ言っていい？本気で心配してる。俺たちはライバルだけど、こういう状態じゃ戦えない。自分を大切にしてくれ。', 'mixed'),
    tmpl('対戦相手として言うと、今シーズンは全然怖くなかった。ピッチに集中できてない感じがした。何かあったのか、と思うよ。', 'criticism'),
    tmpl('記録上はライバルかもしれないけど、今シーズンのパフォーマンスは……もっとやれるだろ。俺でもわかる。', 'criticism'),
  ],
};

// サポーター代表 鈴木健二
const FAN_COMMENTS: Record<ReviewGrade, Template[]> = {
  S: [
    tmpl('もう最高！！${goals}ゴール！スタジアムで何度泣きそうになったか。今シーズンはずっと応援してて本当に良かったと思えるシーズンだった。来年も絶対応援する！', 'praise'),
    tmpl('これは語り継がれると思う。あの試合、あのゴール、全部覚えてる。本当にありがとう。ずっとここにいてくれよ。', 'praise'),
    tmpl('声が枯れるまで叫んだ試合が何試合あったか。今シーズンは最高の贈り物だった。移籍だけはしないでほしい、それだけが心配。', 'praise'),
  ],
  A: [
    tmpl('良かったよ、十分良かった。でもあと一歩踏み込んでほしい場面があったのも事実。サポーターはもっとあなたの本気が見たい。', 'mixed'),
    tmpl('毎試合スタンドで応援した。全体的には満足だけど、大事な試合での「もう少し」が積み重なってる気がする。来年また期待してる。', 'neutral'),
    tmpl('${rating}という評価点、俺には詳しいことはわからないけど、応援していて「良い選手だ」と思える試合は多かった。次シーズンも頑張れ。', 'neutral'),
  ],
  B: [
    tmpl('……難しいな。悪口は言いたくないんだけど、チケット代払って見に来てるこっちとしては、もっと熱くなりたかった。', 'criticism'),
    tmpl('ゴール裏で声張り上げてたけど、正直なかなか盛り上がれなかった。選手の調子がそのままスタジアムの温度に出るんだよ。', 'criticism'),
    tmpl('期待してる分だけ言わせてもらう。今シーズンはワクワクする瞬間が少なかった。来シーズン、驚かせてくれよ。', 'neutral'),
  ],
  C: [
    tmpl('これは言わないといけない。スタンドから見ていて何度もため息をついた。気持ちを見せてくれ。技術じゃなく、気持ちを。', 'criticism'),
    tmpl('SNSでは書かないようにしてる。でも同じ気持ちのサポーターが増えてるのは事実だよ。来シーズンに期待してる、本当に。', 'criticism'),
    tmpl('${goals}ゴールで${matches}試合。正直に言う。もっとやれると思ってた。裏切られた気持ちはないけど……物足りかった。', 'criticism'),
  ],
  D: [
    tmpl('正直に言う。今シーズンは足を運ぶのが辛い時期があった。それがサポーターとして一番悲しい。来シーズンは必ず取り返してくれ。', 'criticism'),
    tmpl('プロである以上、結果への責任がある。このパフォーマンスを続けるなら、スタンドの声が変わってしまう前に何かしてほしい。', 'criticism'),
    tmpl('俺はずっと応援し続ける。それが地元のサポーターってもんだから。でも、正直な話、今シーズンは信じていいのか迷った試合があった。', 'mixed'),
  ],
};

// 解説者 前川由貴
const ANALYST_COMMENTS: Record<ReviewGrade, Template[]> = {
  S: [
    tmpl('データを分析すると、今シーズンの${name}はほぼ全ての指標でリーグ上位に位置している。評価点${rating}はモデル予測値を大きく上回る。次世代のスタープレイヤーとして注目すべき存在だ。', 'praise'),
    tmpl('${goals}ゴール${assists}アシストという数字は表面的な結果に過ぎない。スプリント数、ポジショニング精度、チャンス創出数――全ての指標が高水準だった。', 'praise'),
    tmpl('解説者としてこれだけ言わせてほしい――今シーズンの${name}は「本物」だ。来シーズン、さらに成長した姿を見るのが楽しみでならない。', 'praise'),
  ],
  A: [
    tmpl('評価点平均${rating}は安定した選手の証拠だ。ただ、トップクラスとの差を埋めるには、ここ一番での集中力と爆発力がもう少し必要になってくる。', 'mixed'),
    tmpl('データ的には良いシーズンだった。${goals}ゴールは及第点以上。ただ、決定機成功率を見ると改善の余地がある。次シーズンへの課題として提示したい。', 'mixed'),
    tmpl('${rating}という評価点は「信頼できる選手」の数字だ。ただし「突き抜けた選手」の数字ではない。あと一歩、何かが足りない。', 'neutral'),
  ],
  B: [
    tmpl('評価点${rating}はリーグ平均と大差ない水準だ。この選手が平均的で終わるのか、それとも何かをきっかけに覚醒するのか。来シーズンが分岐点になるだろう。', 'neutral'),
    tmpl('データを見ると、今シーズンの${name}は「良くも悪くも普通」だ。プロとして、それが最も危険な状態かもしれないと解説者として感じる。', 'criticism'),
    tmpl('フィジカルデータもスタッツも、リーグ中位水準。${name}のポテンシャルを知っているだけに、もったいない印象が否めない。', 'criticism'),
  ],
  C: [
    tmpl('数字を見ると、評価点${rating}は厳しい。同ポジションのリーグ平均と比較しても下位に位置している。客観的に言って、改善が急務だ。', 'criticism'),
    tmpl('今シーズンのデータは課題を明確に示している。${matches}試合の出場でこの数字は、技術以外の問題が影響している可能性もある。', 'criticism'),
    tmpl('解説者として感情を排除して見ると、今シーズンの${name}はほぼ全ての指標が低調だった。来シーズンの巻き返しには相当の努力が必要だ。', 'criticism'),
  ],
  D: [
    tmpl('データは嘘をつかない。評価点${rating}、${goals}ゴール。このパフォーマンスを続ければ、上位リーグへの道は遠ざかるばかりだ。', 'criticism'),
    tmpl('フィジカル、スプリント距離、決定機成功率――全てにおいて水準を下回っている。技術の問題だけでないとすれば、生活習慣や精神面の影響も考えられる。', 'criticism'),
    tmpl('記録として残すが、今シーズンの${name}のパフォーマンスは過去数シーズンで最低水準だった。根本的な立て直しが必要だ。', 'criticism'),
  ],
};

// 特殊コンディション追加コメント
const CONDUCT_LINES: Template[] = [
  tmpl('……個人的なことには触れたくないが、ピッチ外での噂が耳に入っている。プロとして自分を律することも義務の一つだ。', 'criticism'),
  tmpl('スポーツ紙の一面に載るのはゴールであってほしい。そうでない記事が増えたのが心配だ。', 'criticism'),
];

const INJURY_LINES: Template[] = [
  tmpl('怪我での離脱が多すぎた。${matches}試合しか出られなかった。コンディション管理を見直してほしい。', 'criticism'),
  tmpl('どれだけ実力があっても、ピッチに立てなければ話にならない。来季は万全の状態で臨んでくれ。', 'criticism'),
];

const YOUNG_LINES: Template[] = [
  tmpl('${age}歳でこれだけやれれば十分だ。焦る必要はない。一歩ずつ成長してくれれば、必ず大きな選手になる。', 'praise'),
  tmpl('若い選手にここまで期待するのも酷かもしれない。ただ、${age}歳で今の環境にいること自体が才能の証明だ。', 'neutral'),
];

const CL_LINES: Template[] = [
  tmpl('チャンピオンズリーグという最高の舞台で経験を積んだ。この経験は来シーズン以降、必ず活きる。', 'praise'),
  tmpl('欧州の舞台でも戦った経験は大きい。そのプレッシャーの中でどう動くかが、今後の成長に直結する。', 'neutral'),
];

// テンプレート文字列置換
function resolve(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

// メインジェネレーター
export function generateSeasonReviews(state: GameState): SeasonReviewEntry[] {
  const summary = state.lastSeasonSummary;
  if (!summary) return [];

  const goals    = summary.goals;
  const assists  = summary.assists;
  const rating   = summary.rating;
  const matches  = summary.matches;
  const league   = summary.leagueId ?? state.currentLeague;
  const position = summary.position ?? state.position;

  const grade = gradePerformance(goals, assists, rating, matches, league, position);

  const vars: Record<string, string | number> = {
    name:    state.playerName,
    goals,
    assists,
    rating:  rating.toFixed(1),
    matches,
    age:     state.age,
    league:  summary.league,
  };

  const isInjuryPlagued  = matches < 12;
  const hasConductIssue  = (state.cabaretPenaltyLevel ?? 0) >= 2 || (state.cabaretCount ?? 0) >= 20;
  const isYoung          = state.age <= 19;
  const hadCL            = (state.trophies ?? []).some(t => t.includes('チャンピオンズリーグ')) ||
                           (state.clGroupStage ?? 0) > 0;

  const reviews: SeasonReviewEntry[] = [];

  // 監督
  const mgrTemplate = pick(MANAGER_COMMENTS[grade]);
  let mgrComment = resolve(mgrTemplate.text, vars);
  if (isInjuryPlagued) mgrComment += ' ' + resolve(pick(INJURY_LINES).text, vars);
  reviews.push({
    reviewerName:  '城戸 敏雄',
    reviewerRole:  '監督',
    reviewerEmoji: '👔',
    comment:       mgrComment,
    sentiment:     isInjuryPlagued ? 'mixed' : mgrTemplate.sentiment,
    grade,
  });

  // 記者
  const jrnTemplate = pick(JOURNALIST_COMMENTS[grade]);
  let jrnComment = resolve(jrnTemplate.text, vars);
  if (hasConductIssue) jrnComment += ' ' + resolve(pick(CONDUCT_LINES).text, vars);
  reviews.push({
    reviewerName:  '田辺 純一',
    reviewerRole:  'スポーツ記者',
    reviewerEmoji: '📰',
    comment:       jrnComment,
    sentiment:     hasConductIssue ? 'criticism' : jrnTemplate.sentiment,
    grade,
  });

  // ライバル
  const rivTemplate = pick(RIVAL_COMMENTS[grade]);
  reviews.push({
    reviewerName:  '謎の選手',
    reviewerRole:  'ライバル選手',
    reviewerEmoji: '⚔️',
    comment:       resolve(rivTemplate.text, vars),
    sentiment:     rivTemplate.sentiment,
    grade,
  });

  // サポーター
  const fanTemplate = pick(FAN_COMMENTS[grade]);
  reviews.push({
    reviewerName:  '鈴木 健二',
    reviewerRole:  'サポーター代表',
    reviewerEmoji: '🏟️',
    comment:       resolve(fanTemplate.text, vars),
    sentiment:     fanTemplate.sentiment,
    grade,
  });

  // 解説者
  const anlTemplate = pick(ANALYST_COMMENTS[grade]);
  let anlComment = resolve(anlTemplate.text, vars);
  if (isYoung)  anlComment += ' ' + resolve(pick(YOUNG_LINES).text, vars);
  if (hadCL)    anlComment += ' ' + resolve(pick(CL_LINES).text, vars);
  reviews.push({
    reviewerName:  '前川 由貴',
    reviewerRole:  '解説者・アナリスト',
    reviewerEmoji: '🎙️',
    comment:       anlComment,
    sentiment:     isYoung ? 'neutral' : anlTemplate.sentiment,
    grade,
  });

  return reviews;
}

// グレード表示用
export const GRADE_LABEL: Record<ReviewGrade, string> = {
  S: '傑出',
  A: '優秀',
  B: '標準',
  C: '不調',
  D: '低調',
};

export const GRADE_COLOR: Record<ReviewGrade, string> = {
  S: '#eab308',
  A: '#22c55e',
  B: '#3b82f6',
  C: '#f97316',
  D: '#ef4444',
};

export const SENTIMENT_COLOR: Record<ReviewSentiment, string> = {
  praise:   '#22c55e',
  neutral:  '#94a3b8',
  mixed:    '#f59e0b',
  criticism:'#ef4444',
};
