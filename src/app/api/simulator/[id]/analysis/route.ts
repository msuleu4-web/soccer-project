import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createAnonClient, createServiceClient } from '@/lib/supabase/service';
import type { MatchAnalysis, SimulationWithTeams } from '@/types/simulator';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface PlayerRow {
  team_id: string;
  name: string;
  shirt_number: number | null;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  ovr: number | null;
  pac: number | null;
  sho: number | null;
  pas: number | null;
  dri: number | null;
  def_stat: number | null;
  phy: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supa = createAnonClient();
    const service = createServiceClient();

    const { data: sim, error } = await supa
      .from('simulations')
      .select(`
        *,
        home_team:teams!simulations_home_team_id_fkey(*),
        away_team:teams!simulations_away_team_id_fkey(*)
      `)
      .eq('id', params.id)
      .single();

    if (error || !sim) {
      return NextResponse.json({ error: '試合が見つかりません' }, { status: 404 });
    }

    const simulation = sim as SimulationWithTeams & { analysis?: MatchAnalysis };

    if (simulation.analysis) {
      return NextResponse.json({ analysis: simulation.analysis, cached: true });
    }

    const { data: allPlayers } = await supa
      .from('players')
      .select('team_id, name, shirt_number, position, ovr, pac, sho, pas, dri, def_stat, phy, strengths, weaknesses')
      .in('team_id', [simulation.home_team_id, simulation.away_team_id])
      .eq('is_active', true);

    const players = (allPlayers ?? []) as PlayerRow[];
    const homePlayers = players.filter((p) => p.team_id === simulation.home_team_id);
    const awayPlayers = players.filter((p) => p.team_id === simulation.away_team_id);

    const avgOvr = (list: PlayerRow[]) => {
      const ovrs = list.map((p) => p.ovr ?? 70);
      return ovrs.length > 0 ? Math.round(ovrs.reduce((a, b) => a + b, 0) / ovrs.length) : 70;
    };

    const formatPlayerStats = (list: PlayerRow[]) =>
      list
        .map((p) => {
          const num = p.shirt_number ? `#${p.shirt_number} ` : '';
          const stats = `[${p.position}, OVR${p.ovr ?? '?'}, PAC${p.pac ?? '?'}/SHO${p.sho ?? '?'}/PAS${p.pas ?? '?'}/DRI${p.dri ?? '?'}/DEF${p.def_stat ?? '?'}/PHY${p.phy ?? '?'}]`;
          const str = (p.strengths ?? []).join(',');
          const weak = (p.weaknesses ?? []).join(',');
          return `${num}${p.name} ${stats} 強み:${str} 弱み:${weak}`;
        })
        .join('\n');

    const systemPrompt = `あなたはサッカー戦術分析の専門家です。
AIが生成した架空のサッカーの試合結果とイベントデータ、および両チームの選手能力値を与えるので、
プロのサッカー解説者のように詳細な分析レビューを生成してください。

必ず以下のJSON形式のみで応答してください。前後のテキスト・マークダウン・コードブロックは絶対に含めないでください。

{
  "winner_analysis": {
    "team": "home" | "away" | "draw",
    "title": "○○の勝因",
    "factors": ["勝因1 (具体的な選手名とプレーを含む)", "勝因2", "勝因3"]
  },
  "loser_analysis": {
    "team": "home" | "away" | "draw",
    "title": "○○の敗因",
    "factors": ["敗因1 (具体的な選手名とプレーを含む)", "敗因2", "敗因3"]
  },
  "power_comparison": {
    "summary": "両チームの戦力差を2-3文で説明 (OVR差、リーグレベル差を含む)",
    "home_advantages": ["ホームの強み1", "強み2"],
    "away_advantages": ["アウェイの強み1", "強み2"]
  },
  "key_players": [
    {"name": "選手名", "team": "home", "rating": 7.5, "comment": "評価コメント1文"}
  ],
  "tactical_analysis": {
    "summary": "戦術的なポイントを2-3文で",
    "formation_impact": "フォーメーションの噛み合わせがどう影響したか1-2文",
    "style_matchup": "戦術スタイルの相性がどう試合を左右したか1-2文"
  },
  "what_if": "もし○○が△△していたら、結果は変わっていたかもしれない。（1-2文、具体的な選手名を含む）"
}

ルール:
- 選手名は必ず試合データに登場する選手 or 選手リストの選手のみ使用
- key_playersは各チーム2-3名、合計4-6名。ratingは小数第1位 (7.5, 8.0 など)。ゴール関与者は高く
- 分析は具体的に。「良かった」「悪かった」だけでなく「なぜ」を書く
- OVR差が大きい場合はリーグレベル差にも言及する
- 個人を侮辱する表現は使わない。敗因も「相手が上回った」等の中立的な表現で`;

    const matchData = simulation.match_data;
    const events = matchData.events
      .map(
        (e) =>
          `${e.minute}' [${e.type}] ${e.team ?? ''} ${e.scorer ?? ''} ${e.description}`
      )
      .join('\n');

    const userPrompt = `# 試合結果
${simulation.home_team.name} ${simulation.home_score} - ${simulation.away_score} ${simulation.away_team.name}

# フォーメーション・スタイル
${simulation.home_team.name}: ${simulation.home_formation} / ${simulation.home_style}
${simulation.away_team.name}: ${simulation.away_formation} / ${simulation.away_style}

# スタッツ
ボール支配率: ${matchData.home_possession}% - ${matchData.away_possession}%
シュート数: ${matchData.home_shots} - ${matchData.away_shots}

# MVP
${matchData.mvp?.name} (${matchData.mvp?.team}) - ${matchData.mvp?.reason}

# 試合イベント
${events}

# 選手能力値データ
## ${simulation.home_team.name} (平均OVR: ${avgOvr(homePlayers)})
${formatPlayerStats(homePlayers)}

## ${simulation.away_team.name} (平均OVR: ${avgOvr(awayPlayers)})
${formatPlayerStats(awayPlayers)}

上記データに基づき、詳細な試合分析レビューをJSON形式で生成してください。`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let analysis: MatchAnalysis;
    try {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned) as MatchAnalysis;
    } catch {
      console.error('Analysis JSON parse error:', cleaned);
      return NextResponse.json({ error: '分析の生成に失敗しました' }, { status: 500 });
    }

    await service.from('simulations').update({ analysis }).eq('id', params.id);

    return NextResponse.json({ analysis, cached: false });
  } catch (e) {
    console.error('Analysis error:', e);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
