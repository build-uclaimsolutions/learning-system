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

interface LearnPathRequest {
  goal: string
  userId: string
  timeframe?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LearnPathRequest

    if (!body.goal || !body.userId) {
      return NextResponse.json(
        { error: 'Goal and user ID required' },
        { status: 400 }
      )
    }

    const prompt = `Create a personalized learning curriculum for this goal: "${body.goal}"

Generate a structured learning path with:
1. Prerequisites (what skills/knowledge they should have first)
2. 8-12 learning modules with:
   - Module name
   - Key concepts to master
   - Estimated time to complete
   - Resources/topics to study
   - Practical exercise
3. Milestones/checkpoints to validate understanding
4. Advanced topics for after mastery
5. Timeline recommendation

Timeframe: ${body.timeframe || 'flexible'}

Format as a structured JSON object with the above sections.`

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const curriculumText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    const { data: learningGoal, error } = await supabase
      .from('learning_goals')
      .insert({
        user_id: body.userId,
        goal: body.goal,
        curriculum: curriculumText,
        status: 'in_progress',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save learning path' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: learningGoal.id,
      goal: body.goal,
      curriculum: curriculumText,
      status: 'in_progress',
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate learning path' },
      { status: 500 }
    )
  }
}
