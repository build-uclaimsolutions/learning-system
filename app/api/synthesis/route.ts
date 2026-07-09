import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
)

interface SynthesisRequest {
  userId: string
  week: number
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SynthesisRequest

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: summaries } = await supabase
      .from('summaries')
      .select('title, content')
      .eq('user_id', body.userId)
      .gte('created_at', weekAgo)

    const { data: progress } = await supabase
      .from('progress')
      .select('topic, level')
      .eq('user_id', body.userId)
      .gte('completed_date', weekAgo)

    if (!summaries || summaries.length === 0) {
      return NextResponse.json(
        { error: 'No learning data this week' },
        { status: 400 }
      )
    }

    const learningContent = `
This week's summaries:
${summaries.map((s) => `- ${s.title}`).join('\n')}

Key topics studied:
${progress?.map((p) => `- ${p.topic} (${p.level})`).join('\n') || 'No topics logged'}

Summary of all learning:
${summaries.map((s) => s.content).join('\n\n')}
`

    const synthesisPrompt = `Based on this week's learning activities, provide:

1. Weekly Summary (comprehensive overview of all topics learned)
2. Key Insights (3-5 major takeaways)
3. Skill Development (how the learner has progressed)
4. Actionable Takeaways (practical applications of what was learned)
5. Recommended Next Steps (what to focus on next week)

${learningContent}

Format with clear sections and bullet points.`

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 2500,
      messages: [{ role: 'user', content: synthesisPrompt }],
    })

    const summaryText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    const takeawaysPrompt = `Extract 3-5 key actionable takeaways from this synthesis that the user can apply:

${summaryText}

Format as JSON array of strings, e.g. ["takeaway 1", "takeaway 2", ...]`

    const takeawaysResponse = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 500,
      messages: [{ role: 'user', content: takeawaysPrompt }],
    })

    let takeaways = []
    if (takeawaysResponse.content[0].type === 'text') {
      try {
        const jsonMatch = takeawaysResponse.content[0].text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          takeaways = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        takeaways = []
      }
    }

    const currentWeek = body.week || Math.ceil(new Date().getDate() / 7)

    const { data: synthesis, error } = await supabase
      .from('synthesis')
      .insert({
        user_id: body.userId,
        week: currentWeek,
        summary_text: summaryText,
        takeaways: takeaways,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save synthesis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: synthesis.id,
      week: currentWeek,
      summary: summaryText,
      takeaways,
      topicsLearned: summaries.length,
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate synthesis' },
      { status: 500 }
    )
  }
}
