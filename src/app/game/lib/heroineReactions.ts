import type { MatchResult } from '../types/game';
import type { TrainingFeedback } from '../hooks/useGameState';

export type HeroineEmotion = 'excited' | 'happy' | 'normal' | 'worried' | 'sad';
export type HeroineCharacter = 'misaki' | 'rin' | 'koko';

export interface HeroineReaction {
  character: HeroineCharacter;
  emotion: HeroineEmotion;
  line: string;
}

export const CHAR_COLOR: Record<HeroineCharacter, string> = {
  misaki: '#E8B4D8',
  rin:    '#A855C8',
  koko:   '#FF69B4',
};

export const CHAR_NAME: Record<HeroineCharacter, string> = {
  misaki: '碧みさき',
  rin:    '黒崎凛',
  koko:   '桐乃ここ',
};

export const EMOTION_ICON: Record<HeroineEmotion, string> = {
  excited: '✨',
  happy:   '😊',
  normal:  '💬',
  worried: '😟',
  sad:     '🥺',
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(): number {
  return Math.random();
}

// 試合結果ヒロイン反応
export function getMatchReaction(result: MatchResult): HeroineReaction {
  const isCL  = !!result.competition && result.competition.startsWith('cl_');
  const isWC  = !!result.competition && result.competition.startsWith('wc_');
  const isNat = result.competition === 'national';
  const goals = result.playerGoals;
  const assists = result.playerAssists;
  const rating = result.playerRating;
  const win = result.win;
  const draw = result.teamScore === result.opponentScore;
  const loss = !win && !draw;
  const cleanSheet = result.opponentScore === 0;
  const bigWin = win && result.teamScore - result.opponentScore >= 3;
  const closeGame = Math.abs(result.teamScore - result.opponentScore) <= 1;

  // 代表戦
  if (isNat) {
    if (goals >= 2) {
      return { character: 'rin', emotion: 'excited', line: pick([
        `代表戦で${goals}ゴール！データが跳ね上がってます。歴史的な数字ですよ。`,
        `日本代表で${goals}点……これは記録に残りますね。完璧です。`,
      ]) };
    }
    if (goals === 1) {
      return { character: 'rin', emotion: win ? 'happy' : 'normal', line: pick([
        '代表戦でのゴール、データにしっかり刻まれました。',
        '代表でも結果を残せましたね。継続が大事です。',
      ]) };
    }
    return { character: 'rin', emotion: win ? 'happy' : 'worried', line: pick(
      win
        ? ['代表戦の勝利。データ的にも完璧な内容でした。', '日本代表での勝利……素晴らしい数字でした。', '代表チームへの貢献、数字にも出ています。']
        : ['代表戦は惜敗でしたね。次戦の分析をすぐ始めます。', 'この経験をデータに活かしましょう。', '敗因は明確です。修正すれば必ず勝てます。'],
    ) };
  }

  // CL / WC
  if (isCL || isWC) {
    const stage = isCL ? 'チャンピオンズリーグ' : 'ワールドカップ';
    if (goals >= 3) {
      return { character: pick(['misaki', 'koko'] as HeroineCharacter[]), emotion: 'excited', line: pick([
        `${stage}でハットトリック！！信じられない！！`,
        `世界の大舞台で${goals}ゴール……もう伝説だよ！！`,
        `${goals}ゴール！！やばすぎる！これ世界中が見てるんだよ！！`,
      ]) };
    }
    if (goals >= 1 && win) {
      return { character: pick(['misaki', 'rin'] as HeroineCharacter[]), emotion: 'excited', line: pick([
        `${stage}でゴールして勝利！世界の舞台でも輝いてるんだね！`,
        `得点に勝利！${stage}での活躍、データも最高です。`,
        '世界相手にゴールを決めるなんて……ほんとに誇らしいよ！',
      ]) };
    }
    if (win) {
      return { character: pick(['misaki', 'rin'] as HeroineCharacter[]), emotion: 'excited', line: pick([
        `${stage}突破！世界の舞台でも輝いてるんだね！ほんとに誇らしいよ！`,
        `国際試合での勝利……データも最高です。次も期待してますよ。`,
        '強豪相手に勝てた！この経験は絶対これからの糧になるよ！',
      ]) };
    }
    if (goals >= 1) {
      return { character: 'misaki', emotion: 'normal', line: pick([
        `負けたけど、${stage}でゴールできたのは本物の証だよ。`,
        `チームは負けたけど……あなたのゴールは世界に届いたよ。`,
        '悔しいけど、世界レベルで通用してるって証明できたじゃないか！',
      ]) };
    }
    return { character: 'misaki', emotion: 'sad', line: pick([
      '悔しいよね……でも挑んだことがすごいんだよ。胸張って！',
      '世界はまだまだ広いね。この経験、きっと次に活きるよ。',
      'ここまで来られたことがもうすごいんだよ。また絶対戻ってこようね！',
    ]) };
  }

  // 5ゴール以上（超絶爆発）
  if (goals >= 5) {
    return { character: 'koko', emotion: 'excited', line: pick([
      `${goals}ゴール！！！？ちょっと待って何これ！！SNSが爆発してる！！`,
      `${goals}点って……もはや伝説！！すぐ動画にしないと！！`,
      `え、${goals}ゴール！？バグじゃないよね！？史上最高のコンテンツすぎる！！`,
    ]) };
  }

  // 4ゴール
  if (goals === 4) {
    if (rand() < 0.4) {
      return { character: 'koko', emotion: 'excited', line: pick([
        '4ゴール！！もうフォロワーが爆増してるんだけど！！すごすぎ！',
        '4点って……私のコンテンツの中で一番バズりそう！！ありがとう！！',
      ]) };
    }
    return { character: 'misaki', emotion: 'excited', line: pick([
      '4ゴール！？もう言葉が出てこない……あなた本当にすごいよ！！',
      'えっ4点！？ふつうじゃないって！！ほんとにほんとにすごい！！',
      '4ゴール達成！！誰も止められなかったんだね……かっこよすぎる！',
    ]) };
  }

  // ハットトリック
  if (goals === 3) {
    // 勝利ハットトリック
    if (win) {
      if (rand() < 0.35) {
        return { character: 'koko', emotion: 'excited', line: pick([
          'ハットトリックで勝利！！これは絶対バズる！撮っていいですか！？',
          'やばいやばい！！3点で勝ったよ！フォロワーに見せなきゃ！！',
          '3ゴール＆勝利！！私のタイムライン全部これになってる！！',
        ]) };
      }
      return { character: 'misaki', emotion: 'excited', line: pick([
        'ハットトリックで勝利！！もう最高すぎて涙出てきた！！',
        '3点決めて勝てた！！信じられない……ほんとにすごいよ！！',
        'ハットトリック！！一生忘れられない試合になったね！！',
        '3ゴール！もう言葉にならない……すごすぎるよ！',
      ]) };
    }
    // 引き分けハットトリック
    if (draw) {
      return { character: pick(['misaki', 'rin'] as HeroineCharacter[]), emotion: 'normal', line: pick([
        `3点取ったのに引き分け……でもあなたは最高だったよ！チームが追いついてくれなかったんだ。`,
        'ハットトリックで引き分けか……データ的にはあなたは完璧でした。チーム全体の問題ですね。',
        '3ゴールで引き分けって悔しいよね……でもあなたのゴールは本物だよ！',
      ]) };
    }
    // 負けハットトリック
    return { character: pick(['misaki', 'rin'] as HeroineCharacter[]), emotion: 'worried', line: pick([
      `3点取ったのにチームは負けた……悔しいよね。でも${goals}点は絶対に価値があるよ！`,
      'ハットトリックしたのに負けるなんて……あなたのゴールは本物だった。チームの問題だよ。',
      'データ的にあなたのパフォーマンスは100点です。チームのせいで勝ち点が取れなかっただけです。',
      '3点決めて負けるなんて……悔しすぎるよね。でもあなたは責任果たしたよ！',
    ]) };
  }

  // 評価点9.5以上（マン・オブ・ザ・マッチ級）
  if (rating >= 9.5) {
    if (loss) {
      if (rand() < 0.3) {
        return { character: 'rin', emotion: 'worried', line: pick([
          `評価点${rating.toFixed(1)}で負けとは……データ的にあなたは完璧でした。チームに問題があります。`,
          'スタッツは異次元なのに負けた。個人としては最高でも、チームがついてこなかった。',
        ]) };
      }
      return { character: 'misaki', emotion: 'worried', line: pick([
        `評価点${rating.toFixed(1)}なのに負けちゃった……あなたは全力を尽くしてたよ。`,
        '一人でどれだけ頑張っても……チームスポーツは難しいね。でも輝いてたよ！',
        `${rating.toFixed(1)}点の活躍！負けたのは悔しいけど、あなたのプレーは最高だった！`,
      ]) };
    }
    if (rand() < 0.2) {
      return { character: 'koko', emotion: 'excited', line: pick([
        `評価点${rating.toFixed(1)}！？スタッツが異次元……！フォロワーに絶対見せなきゃ！`,
        'この数字はコンテンツにしないともったいない！神プレーすぎる！',
        `${rating.toFixed(1)}点！？数字が嘘みたい！もうトレンド入りしちゃう！！`,
      ]) };
    }
    return { character: 'misaki', emotion: 'excited', line: pick([
      `評価点${rating.toFixed(1)}！もう誰もあなたを止められないよ！`,
      'マン・オブ・ザ・マッチ最高評価……誇らしいよ！',
      `${rating.toFixed(1)}点！！神がかってる……！ずっと応援してきてよかった！`,
      'この試合のあなた、ほんとにかっこよかった……目が離せなかったよ！',
    ]) };
  }

  // 評価点8.5〜9.4（好調）
  if (rating >= 8.5) {
    if (rand() < 0.25) {
      return { character: 'rin', emotion: 'happy', line: pick([
        `評価点${rating.toFixed(1)}。データも申し分ない内容でした。この調子を維持してください。`,
        `${rating.toFixed(1)}点の活躍。統計的にもトップクラスのパフォーマンスです。`,
      ]) };
    }
    return { character: 'misaki', emotion: win ? 'excited' : 'happy', line: pick([
      `評価点${rating.toFixed(1)}！絶好調じゃないか！！すごすぎるよ！`,
      'この調子、ずっと続けてね！見てて惚れ惚れするよ！',
      `${rating.toFixed(1)}点！！今日のあなた最高だった……思わず声出ちゃった！`,
    ]) };
  }

  // 勝利
  if (win) {
    // 大勝（3点差以上）
    if (bigWin && goals >= 2) {
      return { character: pick(['misaki', 'koko'] as HeroineCharacter[]), emotion: 'excited', line: pick([
        `大勝利＆${goals}ゴール！完璧な試合だったね！！`,
        `${result.teamScore}対${result.opponentScore}で大勝！あなたがいると全然違うんだね！`,
        `圧勝＆${goals}点！！今日のあなた無双すぎた！！`,
      ]) };
    }
    if (bigWin) {
      return { character: 'misaki', emotion: 'excited', line: pick([
        `${result.teamScore}対${result.opponentScore}！大勝利！チームが強くなってるのわかる！`,
        '圧倒的な勝ち方だったね！あなたの貢献が大きいよ！',
        '大差の勝利！チームワークが光ってたね！すばらしかった！',
      ]) };
    }
    // クリーンシート勝利
    if (cleanSheet) {
      if (goals >= 1) {
        return { character: 'misaki', emotion: 'happy', line: pick([
          `${goals}点取って無失点！完璧な試合だったよ！`,
          '無失点で勝利！守備も攻撃も最高！チーム一丸だったね！',
          `ゴールして完封勝利！理想的な展開だったね。えらい！`,
        ]) };
      }
      return { character: 'misaki', emotion: 'happy', line: pick([
        '無失点勝利！守備陣の頑張りもあったけど、あなたの存在感もすごかったよ！',
        '完封勝利！チーム全体がまとまってたね。よかった〜！',
      ]) };
    }
    // ギリギリ勝利（1点差）
    if (closeGame) {
      if (goals >= 1) {
        return { character: 'misaki', emotion: 'happy', line: pick([
          `ギリギリだったけど……あなたのゴールが決め手になったね！`,
          '1点差の接戦を制した！あなたのゴールがなかったら危なかったよ！',
          `${goals}点取って辛勝！あなたが決めてくれてよかった〜！`,
        ]) };
      }
      return { character: 'misaki', emotion: 'happy', line: pick([
        '1点差の難しい試合に勝てた！集中力が大事だったね！',
        'ギリギリの勝利！こういう試合をものにできるのが強さだよ！',
        'ハラハラしたけど勝てた！本当によかった〜！',
      ]) };
    }
    // 2ゴール
    if (goals >= 2) {
      return { character: 'misaki', emotion: 'happy', line: pick([
        `${goals}ゴールで勝利！最高の試合だったね！`,
        `${goals}点決めて勝てた！もう止められないね！`,
        'ゴールに勝利……完璧じゃないですか！えらい！',
        `${goals}点！勝って点取って……理想的すぎる試合だよ！`,
      ]) };
    }
    // アシストのみ（ゴール0だがアシスト有）
    if (goals === 0 && assists >= 2) {
      return { character: pick(['misaki', 'rin'] as HeroineCharacter[]), emotion: 'happy', line: pick([
        `${assists}アシスト！ゴールはなくてもチームの攻撃を作ってたんだね！`,
        'アシストでチームを勝利に導いた！縁の下の力持ちだよ！',
        `${assists}アシストは立派です。データ的にも得点への関与率が高い。`,
      ]) };
    }
    // 1ゴール
    if (goals === 1) {
      return { character: 'misaki', emotion: 'happy', line: pick([
        'ゴールも決めて勝てたね！よかった〜！',
        '1点決めて勝利！この調子で続けよう！',
        'ゴールして勝利！最高の結果だよ！',
        '得点もしっかり残して勝った！完璧だよ！',
      ]) };
    }
    // ゴールなし勝利
    return { character: 'misaki', emotion: 'normal', line: pick([
      '勝てたね！次はゴールも決めようね？応援してるよ！',
      'チームの勝利に貢献したんだよ！ゴールだけじゃないから！',
      '勝利は勝利！チームのために頑張ったんだよね！えらい！',
      '勝ちは勝ち！次は絶対ゴールも一緒に狙おうね！',
    ]) };
  }

  // 引き分け
  if (draw) {
    if (goals >= 2) {
      return { character: 'misaki', emotion: 'normal', line: pick([
        `${goals}点取ったのに引き分けか〜……でもあなたは十分頑張ったよ！`,
        `${goals}ゴールで引き分け。チームがあなたの活躍に応えてくれなかったね。`,
        `${goals}点も決めたのに！もどかしいね……でも責任はないよ！`,
      ]) };
    }
    if (goals === 1) {
      return { character: 'misaki', emotion: 'normal', line: pick([
        `引き分けか〜……でも${goals}点取れたじゃないですか！次は勝とうね！`,
        'ゴールして引き分け……もう1点あれば！でも次は絶対勝てる！',
        '引き分けでも1点取った！積み重ねが大事だよ、焦らずに！',
      ]) };
    }
    if (assists >= 1) {
      return { character: 'misaki', emotion: 'normal', line: pick([
        'アシストで貢献したのに引き分けか……勝ちにつなげたかったね。',
        '引き分けだけど、あなたは攻撃を作ってたよ！見えない貢献がある！',
      ]) };
    }
    if (cleanSheet) {
      return { character: 'rin', emotion: 'normal', line: pick([
        'スコアレスドロー。失点0は評価できます。次は得点面の改善ですね。',
        '0対0の引き分け。守備は完璧でした。あとは決定力の問題です。',
      ]) };
    }
    return { character: 'misaki', emotion: 'worried', line: pick([
      '引き分け……もう少しで届いたのにね。次は絶対勝てる！',
      '悔しかった？大丈夫、一緒に頑張ろう！',
      '引き分けか〜……うまくいかない日もあるよ。次！次！',
      '惜しかったね……でも勝ち点1は取れたよ！プラスに考えよう！',
    ]) };
  }

  // 敗北

  // 負けたけどゴールを決めた
  if (loss && goals >= 2) {
    return { character: pick(['misaki', 'rin'] as HeroineCharacter[]), emotion: 'worried', line: pick([
      `チームは負けたけど${goals}ゴール……あなたはやることやったよ！`,
      `${goals}点も取ったのに負けるなんて……でもあなたの頑張りは無駄じゃないよ！`,
      `${goals}ゴールで負け……データ的にあなたの責任ではありません。チームの守備の問題です。`,
      `${goals}点決めたんだから悔やまなくていい！あなたは全力を尽くしたよ！`,
    ]) };
  }
  if (loss && goals === 1) {
    return { character: 'misaki', emotion: 'worried', line: pick([
      '負けたけど、ゴールは決めた！あなたは諦めなかったんだね。',
      'チームは負けちゃったけど……1点取ったのはちゃんと見てたよ！',
      'ゴールしたのに勝てなかった……悔しいよね。でも前を向こう！',
      '1点取って負け……あなたのゴールが光ってたよ。本当に！',
    ]) };
  }

  // アシストはあった
  if (loss && assists >= 1 && goals === 0) {
    return { character: 'misaki', emotion: 'worried', line: pick([
      `負けたけど${assists}アシスト！あなたはチームのために動いてたよ。`,
      'アシストして負けた……チームがもっと決めてくれればね。悔しいよね。',
    ]) };
  }

  // 高評価で負け
  if (rating >= 7.5) {
    if (rand() < 0.3) {
      return { character: 'rin', emotion: 'worried', line: pick([
        `評価点${rating.toFixed(1)}での敗北。あなたのパフォーマンスに問題はありません。`,
        'データを見ればあなたがチームを引っ張っていた。チーム全体の問題です。',
        `${rating.toFixed(1)}点のスタッツ。次は戦術面を修正すれば必ず勝てます。`,
      ]) };
    }
    return { character: 'misaki', emotion: 'worried', line: pick([
      '負けちゃったけど……頑張ってたのちゃんと見てたよ。',
      '評価点は高かった！チームの状況だよ。次は勝てる！',
      'あなたは十分やったよ……次はきっと結果がついてくるよ！',
      '一生懸命戦ってたのわかった！負けても諦めないあなたが好きだよ！',
    ]) };
  }

  // 完封負け（0点、低評価）
  if (goals === 0 && rating < 6.0) {
    return { character: 'misaki', emotion: 'sad', line: pick([
      '今日は調子が上がらなかったね……でも一日でリセットして次いこう！',
      'うまくいかない日は誰にでもある。明日また頑張ろう！',
      '何があったの？話したかったら聞くよ……一人で抱え込まないでね。',
      '今日はゆっくり休んで。明日のあなたに期待してる！',
    ]) };
  }

  // 接戦の負け
  if (closeGame) {
    return { character: 'misaki', emotion: 'sad', line: pick([
      '1点差……悔しいね。本当にもう少しだったよ！',
      'ギリギリだったね……でも次はこの悔しさをエネルギーにしよう！',
      '惜しかった！紙一重だったんだよ。次は絶対に勝とう！',
    ]) };
  }

  // 大敗
  if (result.opponentScore - result.teamScore >= 3) {
    return { character: 'misaki', emotion: 'sad', line: pick([
      '大差の負けはつらいよね……一緒に立て直そう、絶対大丈夫！',
      '今日は相手が強かった。でもこれで終わりじゃないよ！',
      '落ち込まないで……こういう経験が人を強くするんだよ！',
    ]) };
  }

  // 通常の敗北
  return { character: 'misaki', emotion: 'sad', line: pick([
    'つらかったね……ゆっくり休んで。私がそばにいるから。',
    '今日はうまくいかなかったね……また一緒に立ち上がろう。',
    '負けた日は思いっきり悔しがっていいよ。また明日から頑張ろう！',
    '悔しかった？うん……でも諦めないあなたが好きだよ。また一緒に頑張ろう！',
  ]) };
}

// トレーニング結果ヒロイン反応
export function getTrainingReaction(feedback: TrainingFeedback): HeroineReaction | null {
  if (feedback.outcome === 'success' || feedback.outcome === 'failure') {
    if (Math.random() < 0.5) return null;
  }
  switch (feedback.outcome) {
    case 'critical_success':
      return { character: pick(['misaki', 'koko'] as HeroineCharacter[]), emotion: 'excited', line: pick([
        '大成功！やっぱりすごい！ちゃんと見てたよ！',
        'めちゃくちゃかっこよかった！大成功！誇らしい！',
        '大成功！！今日のトレーニング最高だったよ！！',
        'これはバズる……！大成功の瞬間もらいました！！（ここ）',
        '完璧なトレーニング！この調子で絶対上に行けるよ！',
      ]) };
    case 'success':
      return { character: 'misaki', emotion: 'happy', line: pick([
        '今日もトレーニング頑張ったね！えらい！',
        'コツコツ努力してる姿、ちゃんと見てるよ！',
        'いい感じだよ！この調子で続けよう！',
        '毎日の積み重ねが大事だよね！今日もお疲れさま！',
        'ナイストレーニング！少しずつ強くなってるの感じるよ！',
      ]) };
    case 'failure':
      return { character: 'misaki', emotion: 'normal', line: pick([
        'うまくいかない日もあるよ。また明日！',
        '失敗は次への糧だよ。気にしないで！',
        '今日はたまたまだよ。明日また頑張ろう！',
        'ドンマイ！失敗してもまた挑戦できるんだから！',
      ]) };
    case 'critical_failure':
      return { character: 'misaki', emotion: 'worried', line: pick([
        '大丈夫？無理しすぎないでね……心配だよ。',
        'ちゃんと休んでる？体が一番大事だよ。',
        '無理は禁物だよ！今日はゆっくり休んでね。',
        '疲れてるんじゃないの？少し休息を取った方がいいかも……',
      ]) };
  }
}

// 怪我状態変化ヒロイン反応
export function getInjuryReaction(prevInjury: number, newInjury: number): HeroineReaction | null {
  if (newInjury > prevInjury && newInjury > 0) {
    const severity = newInjury >= 4 ? 'serious' : newInjury >= 2 ? 'moderate' : 'mild';
    if (severity === 'serious') {
      return { character: 'misaki', emotion: 'sad', line: pick([
        'ひどい怪我……すぐに休んで！無理しないで！絶対に！',
        '重傷……？ちゃんと治療してね。焦らなくていいから。',
        '大丈夫？！今すぐ無理はやめて！ゆっくり回復させてね……！',
      ]) };
    }
    if (severity === 'moderate') {
      return { character: 'misaki', emotion: 'worried', line: pick([
        '怪我……大丈夫？無理しないでね。ずっとそばにいるから。',
        '怪我したの？心配……早く良くなってね。',
        '無理しないで……怪我は時間をかけて治さないとダメだよ！',
      ]) };
    }
    return { character: 'misaki', emotion: 'worried', line: pick([
      '軽い怪我みたいだけど……ちゃんとケアしてね！',
      '怪我、気をつけてね。無理して悪化させないように！',
    ]) };
  }
  if (prevInjury > 0 && newInjury === 0) {
    return { character: 'misaki', emotion: 'happy', line: pick([
      '怪我が治ったんだね！よかった！もう無理しないでね？',
      '回復したんだ！ホッとした〜！また一緒に頑張ろうね！',
      '完全復活！待ってたよ！！またあなたのプレーが見られる！',
      'よかった〜！心配してたんだよ……もう無理しないでね！',
    ]) };
  }
  return null;
}
