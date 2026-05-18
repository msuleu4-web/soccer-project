import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createAnonClient, createServiceClient } from '@/lib/supabase/service';
import { hashAnonId } from '@/lib/board/hash';
import type { Formation, TacticalStyle, MatchData } from '@/types/simulator';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface RequestBody {
  home_team_id: string;
  away_team_id: string;
  home_formation: Formation;
  away_formation: Formation;
  home_style: TacticalStyle;
  away_style: TacticalStyle;
  anon_id: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  // 必須環境変数チェック (EC2 などで未設定の場合を早期検出)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[simulator/generate] Missing env vars:', {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    return NextResponse.json({ error: 'サーバー設定エラー (env)' }, { status: 500 });
  }
  if (!process.env.GROQ_API_KEY) {
    console.error('[simulator/generate] Missing GROQ_API_KEY');
    return NextResponse.json({ error: 'サーバー設定エラー (ai)' }, { status: 500 });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.home_team_id || !body.away_team_id || body.home_team_id === body.away_team_id) {
      return NextResponse.json({ error: '異なる2チームを選択してください' }, { status: 400 });
    }
    if (!body.anon_id || !UUID_RE.test(body.anon_id)) {
      return NextResponse.json({ error: 'anon_id が不正です' }, { status: 400 });
    }

    const supa = createAnonClient();

    const { data: teams, error: teamErr } = await supa
      .from('teams')
      .select('*')
      .in('id', [body.home_team_id, body.away_team_id]);

    if (teamErr || !teams || teams.length < 2) {
      return NextResponse.json({ error: 'チームが見つかりません' }, { status: 400 });
    }

    const home = teams.find((t) => t.id === body.home_team_id)!;
    const away = teams.find((t) => t.id === body.away_team_id)!;

    // ===== 選手データ取得 =====
    const { data: allPlayers } = await supa
      .from('players')
      .select('team_id, name, shirt_number, position, ovr, pac, sho, pas, dri, def_stat, phy, strengths, weaknesses')
      .in('team_id', [body.home_team_id, body.away_team_id])
      .eq('is_active', true)
      .order('position')
      .order('ovr', { ascending: false });

    const homePlayers = (allPlayers ?? []).filter((p) => p.team_id === body.home_team_id);
    const awayPlayers = (allPlayers ?? []).filter((p) => p.team_id === body.away_team_id);

    const avgOvr = (players: typeof homePlayers) => {
      const ovrs = players.map((p) => p.ovr ?? 70);
      return ovrs.length > 0 ? Math.round(ovrs.reduce((a, b) => a + b, 0) / ovrs.length) : 70;
    };
    const homeAvgOvr = avgOvr(homePlayers);
    const awayAvgOvr = avgOvr(awayPlayers);

    const formatRoster = (players: typeof homePlayers): string => {
      if (players.length === 0) return '(選手データなし — 一般的な選手名で生成してください)';

      const byPos: Record<string, string[]> = { GK: [], DF: [], MF: [], FW: [] };
      players.forEach((p) => {
        const num = p.shirt_number ? `#${p.shirt_number} ` : '';
        const ovr = p.ovr ? ` (OVR${p.ovr}` : ' (';
        const str =
          p.strengths && p.strengths.length > 0
            ? `, 強み: ${p.strengths.slice(0, 3).join('/')}`
            : '';
        const weak =
          p.weaknesses && p.weaknesses.length > 0
            ? `, 弱み: ${p.weaknesses.slice(0, 2).join('/')}`
            : '';
        byPos[p.position]?.push(`${num}${p.name}${ovr}${str}${weak})`);
      });

      return [
        `GK: ${byPos.GK.join(' / ') || 'なし'}`,
        `DF: ${byPos.DF.join(' / ') || 'なし'}`,
        `MF: ${byPos.MF.join(' / ') || 'なし'}`,
        `FW: ${byPos.FW.join(' / ') || 'なし'}`,
      ].join('\n');
    };

    const homeRoster = formatRoster(homePlayers);
    const awayRoster = formatRoster(awayPlayers);

    const systemPrompt = `あなたはサッカーの試合を実況する日本語の解説者です。
2チームの選手データと戦術を与えられた架空の試合を、リアリティ重視で生成してください。
必ず以下のJSON形式のみで応答してください。前後のテキスト・マークダウン・コードブロックは絶対に含めないでください。

{
  "events": [
    {
      "minute": 8,
      "type": "chance",
      "team": "home",
      "scorer": "選手名(goalの場合のみ)",
      "assist": "選手名(任意)",
      "description": "実況テキスト(日本語、20-60字程度)"
    }
  ],
  "summary": "試合全体の総評(120字以内、日本語)",
  "mvp": { "name": "選手名", "team": "home", "reason": "選出理由(60字以内)" },
  "home_possession": 55,
  "away_possession": 45,
  "home_shots": 12,
  "away_shots": 8
}

# 生成ルール

## イベント
- events は 10-15個 生成すること
- minuteは試合の流れに沿って昇順 (1-90+の範囲、ロスタイムは91-95)
- 必ず1-4個のゴールイベントを含めること
- スコアは現実的な範囲 (0-5点)

## 選手名 (最重要)
- 「出場選手」セクションに記載された選手名のみ使用してください
- 選手リストにない名前は絶対に使用しないでください
- 各選手の背番号も正しく参照してください

## 能力値の反映 (OVR: Overall Rating, 40-99)
- **OVR差が試合結果に直結します**:
  - 平均OVR差が5以上 → 高い方が70-80%の確率で勝利
  - 平均OVR差が3-4 → 高い方が60-70%の確率で勝利
  - 平均OVR差が0-2 → 拮抗した試合 (五分五分)
- OVR85以上の選手は「試合を決定づけるプレー」をしやすい
- OVR70以下の選手は「重大なミス」をすることがある

## 強み・弱みの反映
- 各選手の「強み」に書かれた特徴をプレー描写に必ず反映する
  例: 強み「スピード」→ 「快足を飛ばしてDFラインの裏へ抜け出す」
  例: 強み「決定力」→ 「冷静にゴール左隅へ流し込む」
  例: 強み「空中戦」→ 「CKから強烈なヘディングシュート」
- 「弱み」も時折反映する（ただし侮辱的な表現は避ける）

## 戦術スタイルの反映
- 攻撃的 (attacking) → シュート数多め、前線からハイプレス
- 守備的 (defensive) → 失点少なめ、ブロックを固める描写
- カウンター (counter) → スピードのある選手がカウンターで得点
- バランス (balanced) → 攻守のバランスを重視した描写

## 個人保護ルール (厳守)
- 選手個人への侮辱・人格攻撃は絶対に書かない
- 失敗・ミスは「不運」「相手の好プレー」など中立的な表現で描写する
- これはAIによる架空の試合シミュレーションです

## descriptionの品質
- 日本のサッカー実況・解説風の自然な口調で書く
- 選手名を必ず含める (「シュート！」ではなく「○○のシュート！」)
- 臨場感を大切に (「入った！」「惜しい！」「素晴らしい！」)`;

    const ovrDiff = Math.abs(homeAvgOvr - awayAvgOvr);
    const ovrAdvantage =
      homeAvgOvr > awayAvgOvr
        ? `${home.name}が有利`
        : awayAvgOvr > homeAvgOvr
          ? `${away.name}が有利`
          : '互角';

    const userPrompt = `# 対戦カード
${home.name} (ホーム) vs ${away.name} (アウェイ)

# チーム平均OVR
${home.name}: ${homeAvgOvr}
${away.name}: ${awayAvgOvr}
OVR差: ${ovrDiff} (${ovrAdvantage})

# 戦術設定
**${home.name}** (ホーム):
- フォーメーション: ${body.home_formation}
- スタイル: ${body.home_style}

**${away.name}** (アウェイ):
- フォーメーション: ${body.away_formation}
- スタイル: ${body.away_style}

# 出場選手 (この選手のみ使用すること！)

## ${home.name} (平均OVR: ${homeAvgOvr})
${homeRoster}

## ${away.name} (平均OVR: ${awayAvgOvr})
${awayRoster}

# 指示
上記のチーム情報・選手データ・戦術設定に基づき、90分間の試合を生成してください。
OVR差を考慮した現実的な勝敗結果にしてください。
JSON形式のみで応答してください。`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let matchData: MatchData;
    try {
      // JSON部分だけ抽出 (余計なテキストが付いてしまった場合の保険)
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      matchData = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch (e) {
      console.error('JSON parse error:', cleaned);
      return NextResponse.json({ error: 'AI応答の解析に失敗しました' }, { status: 500 });
    }

    const homeScore = matchData.events.filter((e) => e.type === 'goal' && e.team === 'home').length;
    const awayScore = matchData.events.filter((e) => e.type === 'goal' && e.team === 'away').length;

    const creatorHash = hashAnonId(body.anon_id);
    const { data: inserted, error: insertErr } = await createServiceClient()
      .from('simulations')
      .insert({
        home_team_id: body.home_team_id,
        away_team_id: body.away_team_id,
        home_formation: body.home_formation,
        away_formation: body.away_formation,
        home_style: body.home_style,
        away_style: body.away_style,
        home_score: homeScore,
        away_score: awayScore,
        match_data: matchData,
        creator_hash: creatorHash,
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      console.error('[simulator/generate] Insert error:', JSON.stringify(insertErr));
      return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ id: inserted.id });
  } catch (e) {
    console.error('Simulator generate error:', e);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
