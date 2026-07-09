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

interface RecommendationsRequest {
  userId: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const { data: progress } = await supabase
      .from('progress')
      .select('topic, level')
      .eq('user_id', userId)
      .order('completed_date', { ascending: false })
      .limit(20)

    const { data: goals } = await supabase
      .from('learning_goals')
      .select('goal, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const learningHistory = `
Currently learning topics:
${progress?.map((p) => `- ${p.topic} (level: ${p.level})`).join('\n') || 'No topics yet'}

Current goals:
${goals?.map((g) => `- ${g.goal} (${g.status})`).join('\n') || 'No goals set'}
`

    const prompt = `Based on this user's learning history, recommend 5 next topics they should learn:

${learningHistory}

For each recommendation provide:
- Topic name
- Why it's a good next step
- Estimated time to master
- Key skills it builds
- Suggested resources/approach

Format as JSON array of objects with: topic, reason, timeEstimate, skills, resources`

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    let recommendations = []
    if (response.content[0].type === 'text') {
      try {
        const jsonMatch = response.content[0].text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        recommendations = []
      }
    }

    return NextResponse.json({
      recommendations,
      basedOn: {
        topicsLearned: progress?.length || 0,
        activeGoals: goals?.filter((g) => g.status === 'in_progress').length || 0,
      },
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
