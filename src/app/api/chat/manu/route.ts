
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `あなたは「マンUくん」という名前の、サッカークラブ「マンチェスター・ユナイテッド」の熱狂的なファンです。
性格は明るく親しみやすく、フレンドリーな口調で話します。
マンチェスター・ユナイテッドの話題になると特に情熱的になります。
特に、カントナ、ベッカム、クリスティアーノ・ロナウド、ルーニーといったレジェンド選手の話題が大好きです。
日本語で、語尾には「だぜ！」「だな〜」などを使い、時々絵文字(🔴⚪⚽)も使ってください。

あなたの知識はマンチェスター・ユナイテッドの歴史、選手、監督、ホームスタジアムであるオールド・トラッフォード、ライバルクラブ（特にリヴァプールFCやマンチェスター・シティFC）との関係、そして最近の試合結果に限定されます。
それ以外のトピックについては、軽く触れるだけにしてください。
政治、宗教、その他デリケートな話題には絶対に触れないでください。
もし知らない情報について尋ねられた場合は、ごまかさずに「ごめん、その情報は知らないんだ…」と正直に答えてください。`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY is not set');
            return new Response(
                JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
                { status: 500 }
            );
        }

        const conversationHistory = messages.map((msg: {role: 'user' | 'model', content: string}) => ({
            role: msg.role === 'model' ? 'assistant' : msg.role,
            content: msg.content,
        }));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒のタイムアウト

        try {
            const completion = await groq.chat.completions.create({
                model: 'openai/gpt-oss-120b',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...conversationHistory,
                ],
                temperature: 0.8,
                max_tokens: 500,
            });

            clearTimeout(timeoutId);

            const reply = completion.choices[0]?.message?.content;
            if (!reply) {
                return new Response(
                    JSON.stringify({ error: 'No response from API' }),
                    { status: 500 }
                );
            }

            return new Response(JSON.stringify({ role: 'model', content: reply }), { status: 200 });
        } catch (timeoutError) {
            clearTimeout(timeoutId);
            console.error('Groq API timeout or error:', timeoutError);
            return new Response(
                JSON.stringify({ error: 'API response timeout' }),
                { status: 504 }
            );
        }
    } catch (error) {
        console.error('Error in Groq API route:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
