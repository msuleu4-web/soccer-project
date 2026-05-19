import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// アナリストのペルソナをランダムに選択（毎回違う視点で）
const ANALYSTS = [
  {
    name: '戦術アナリスト・佐藤',
    style: '冷静で論理的な戦術分析が得意。数字とデータを重視する。',
    tone: '客観的・分析的。「〜のデータが示すように」「戦術的な観点から見ると」などを使う。',
  },
  {
    name: '元プロ選手・中村コーチ',
    style: '元FWで現役時代の経験を語ることが多い。熱血で情熱的。',
    tone: '熱血・共感型。「俺が現役だったころ〜」「その気持ち、わかるぞ！」などを使う。',
  },
  {
    name: 'スポーツライター・田村',
    style: '文章が詩的で感情的。ドラマチックな表現が得意。',
    tone: '感情的・詩的。比喩や文学的な表現を使う。「まるで〜のように」「物語の主人公のごとく」など。',
  },
  {
    name: 'ユーロスポーツ解説・マルコ',
    style: '欧州サッカーと比較しながら解説する外国人アナリスト。日本語が少し独特。',
    tone: '外国人口調。「これはヨーロッパでも〜」「インテレッサンテ（面白い）！」など混ぜる。カタカナ多め。',
  },
  {
    name: 'データサイエンティスト・岡田',
    style: 'AIと統計モデルを駆使する新世代アナリスト。xGなどの指標を使う。',
    tone: '現代的・データ重視。「期待得点(xG)的には〜」「統計モデルによると〜」などを使う。',
  },
  {
    name: 'おじいちゃん解説者・山田翁',
    style: '60年のサッカー観戦歴を持つ古参。昔の名選手と比べながら解説する。',
    tone: '懐かしむような口調。「わしが若い頃のあの選手に似ておる」「昔の選手は〜じゃった」など。',
  },
];

const SYSTEM_PROMPT_BASE = `あなたはサッカー試合後の分析コメントを行うキャラクターです。
ユーザーから試合データを受け取り、その試合についての短い分析コメントを日本語で返してください。

【重要なルール】
- 必ず2〜3文、最大150文字以内で簡潔に
- 毎回違う切り口でコメントする（得点、守備、試合展開、選手の成長、次への課題など）
- 試合の具体的な数字や出来事に触れる
- ポジティブな試合でも課題を指摘、厳しい試合でも光る点を見つける
- 選手名を必ず1回以上使う
- 絵文字は1〜2個まで
- 解説スタイルはキャラクターに合わせる`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      playerName, goals, assists, rating, win,
      teamScore, opponentScore, opponent, league,
      age, position, ovr, highlights,
    } = body;

    // ランダムにアナリストを選択
    const analyst = ANALYSTS[Math.floor(Math.random() * ANALYSTS.length)];

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

【あなたのキャラクター】
名前: ${analyst.name}
スタイル: ${analyst.style}
口調: ${analyst.tone}`;

    const posLabel: Record<string, string> = {
      FW: 'フォワード', MF: 'ミッドフィールダー',
      DF: 'ディフェンダー', GK: 'ゴールキーパー',
    };

    const resultText = win
      ? `${teamScore}-${opponentScore}で勝利`
      : teamScore === opponentScore
      ? `${teamScore}-${opponentScore}で引き分け`
      : `${teamScore}-${opponentScore}で敗北`;

    const highlightSample = (highlights as string[] ?? []).slice(0, 3).join(' / ');

    const userMessage = `
試合データ:
- 選手: ${playerName}（${posLabel[position] ?? position}、${age}歳、OVR ${ovr}）
- リーグ: ${league}
- 対戦相手: ${opponent}
- 結果: ${resultText}
- 個人成績: ${goals}ゴール / ${assists}アシスト / 評価点${rating}
- ハイライト: ${highlightSample || 'なし'}

この試合についてコメントしてください。`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 1.0,
      max_tokens: 200,
    });

    const comment = completion.choices[0].message.content ?? '';

    return Response.json({
      comment,
      analystName: analyst.name,
    });
  } catch (err) {
    console.error('[analyst API] error:', err);
    // フォールバック: APIが失敗した場合はローカルで生成
    return Response.json({
      comment: null,
      analystName: null,
    });
  }
}
