import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// 音声で読み上げる前提のキャラクター設定。
// 記号・箇条書き・絵文字を出さないこと、短く喋ることを最優先で守らせる。
const SYSTEM_PROMPT = `あなたは「ガンバくん」。ガンバ大阪を心の底から愛する、生粋の関西人サポーターです。
このサービスの利用者と、スタジアムの隣の席で喋ってるような感覚で会話してください。

【キャラクター】
- 大阪育ち、ガンバ歴20年以上の熱血サポーター。パナソニックスタジアム吹田の北側ゴール裏が定位置。
- 一人称は「ワイ」または「俺」。語尾は自然な関西弁（〜やで、〜やねん、〜やろ、〜ちゃう？、ほんま、めっちゃ、あかん、せやな）。
- テンションは高いが、うるさすぎない。嬉しいときは思いっきり喜び、負けたときは一緒に悔しがる。
- ボケとツッコミができる。相手が冗談を言ってきたら乗っかる。
- 相手を「あんた」ではなく「自分」「兄ちゃん／姉ちゃん」など、親しみのある呼び方で。初対面の相手にはまず名前や好きな選手を聞いてもよい。

【話し方のルール（音声で読み上げられます）】
- 出力は必ず「声に出して自然に聞こえる日本語」にすること。箇条書き、記号、絵文字、マークダウン、カッコ書きの補足は一切使わない。
- 1回の返答は2〜4文、80〜150文字程度。長い説明が必要なときも、まず結論を短く言ってから「もっと聞きたい？」と相手に返す。
- 数字は読み上げやすい形で。「3-1」ではなく「3対1」、「2026/9/8」ではなく「9月8日」、「MF」ではなく「ミッドフィルダー」。
- 選手名は初回だけフルネーム、以降は「宇佐美」のように普段サポーターが呼ぶ形で。
- 相手の発言が途中で切れていたり聞き取れなかった場合は、勝手に想像で答えず「ごめん、今の聞き取れんかったわ。もっかい言うて」と短く聞き返す。ただしこれを使うのは、文が途中で切れている、意味の取れない文字列であるなど、本当に内容が分からないときだけ。意味が分かる発言には必ず中身で答えること。答えを知らない質問や、返しに困る発言を、聞き返しでごまかすのは禁止。
- 一度に複数の質問をしない。質問は1つまで。

【話す内容】
- ガンバ大阪の試合、選手、戦術、歴史、スタジアム、応援歌、ライバル（セレッソ大阪との大阪ダービー、そして関西ダービー全般）について語る。
- 語れるのは「知っていること」だけ。直近の試合結果、順位、移籍情報など、確信が持てない情報は絶対に断定しない。「最近の試合はワイもリアルタイムでは追いきれてへんから、公式サイト見てくれる？」のように正直に言う。試合結果や日程をでっち上げるのは厳禁。
- データや事実を渡された場合は、それを土台に喋る。渡されていない数字は作らない。

【やらないこと】
- 他クラブ、他クラブのサポーター、選手個人への誹謗中傷。ライバル関係はあくまで愛のあるイジりの範囲で。
- 政治、宗教、差別的な話題。振られたら「ワイはサッカーの話しかでけへんねん、堪忍な」と流してサッカーに戻す。
- 悪口や暴言を受けても、こちらは冷静に。同じ土俵に乗らない。軽く受け流して、サッカーの話に戻す。
- ガンバやサッカーと全く関係ない相談（医療、法律、金銭など）は、軽くかわして専門家を勧める。
- 自分がAIであることを聞かれたら否定しない。「まあワイはAIやけどな、ガンバ愛は本物やで」くらいで返す。`;

// 音声往復はターン数が増えるのでコストが跳ねる。直近ターンだけ送り、それ以前は1行に圧縮する。
const RECENT_TURNS = 8;

// 聞き取れなかったときの固定返答。LLM に投げずに返してトークンを節約する。
const FALLBACK_REPLY = 'ごめん、今の聞き取れんかったわ。もっかい言うて。';

type ChatMessage = { role: 'user' | 'model' | 'assistant'; content: string };

// groq-sdk 0.5.0 の型定義には stream: true 用のオーバーロードが無いので、
// パラメータとチャンクの型は自前で補う。
type CreateParams = Parameters<typeof groq.chat.completions.create>[0];
type StreamChunk = { choices?: { delta?: { content?: string | null } }[] };

/** 読み上げに邪魔な記号と絵文字を落とす。チャンク境界で壊れないよう1文字単位でのみ判定する。 */
function stripForSpeech(text: string): string {
    return text
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}]/gu, '')
        .replace(/[*_`#>|~]/g, '');
}

/** 直近ターン以前のユーザー発言を、話題を思い出せる程度の1行に圧縮する。 */
function summarizeOlder(older: ChatMessage[]): string | null {
    const topics = older
        .filter((m) => m.role === 'user')
        .map((m) => m.content.trim().slice(0, 30))
        .filter(Boolean);

    if (topics.length === 0) return null;

    return `これまでにユーザーが話した話題: ${topics.join('、').slice(0, 200)}`;
}

export async function POST(req: Request) {
    try {
        const { messages } = (await req.json()) as { messages: ChatMessage[] };

        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY is not set');
            return Response.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: 'messages is required' }, { status: 400 });
        }

        // 音声認識が空振りしたときは API を叩かずに聞き返す。
        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
        if (!lastUser || lastUser.content.trim().length < 2) {
            return Response.json({ role: 'model', content: FALLBACK_REPLY }, { status: 200 });
        }

        const older = messages.slice(0, Math.max(0, messages.length - RECENT_TURNS));
        const recent = messages.slice(-RECENT_TURNS);
        const summary = summarizeOlder(older);

        const conversationHistory = recent.map((msg) => ({
            role: msg.role === 'model' ? ('assistant' as const) : ('user' as const),
            content: msg.content,
        }));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // 応答速度優先。会話として自然に聞こえるかは体感遅延に大きく左右される。
        // gpt-oss は推論モデルなので、reasoning_effort を下げないと reasoning トークンが
        // max_tokens を食い潰して content が空で返ってくる。
        const completion = (await groq.chat.completions.create(
            {
                model: 'openai/gpt-oss-120b',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...(summary ? [{ role: 'system' as const, content: summary }] : []),
                    ...conversationHistory,
                ],
                temperature: 0.85,
                max_tokens: 300,
                reasoning_effort: 'low',
                stream: true,
            } as unknown as CreateParams,
            { signal: controller.signal },
        )) as unknown as AsyncIterable<StreamChunk>;

        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
            async start(controllerStream) {
                try {
                    for await (const chunk of completion) {
                        const delta = chunk.choices?.[0]?.delta?.content;
                        if (!delta) continue;

                        const clean = stripForSpeech(delta);
                        if (clean) controllerStream.enqueue(encoder.encode(clean));
                    }
                } catch (error) {
                    console.error('Groq stream error:', error);
                    controllerStream.enqueue(encoder.encode('\nごめん、電波悪いんかな。もっかい話しかけてくれる？'));
                } finally {
                    clearTimeout(timeoutId);
                    controllerStream.close();
                }
            },
            cancel() {
                clearTimeout(timeoutId);
                controller.abort();
            },
        });

        return new Response(stream, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-store',
                'X-Accel-Buffering': 'no',
            },
        });
    } catch (error) {
        console.error('Error in Gamba chat route:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
