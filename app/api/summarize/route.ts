import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
)

interface SummarizeRequest {
  url?: string
  text?: string
  userId: string
}

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    })
    const text = response.data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
    return text.substring(0, 8000)
  } catch (error) {
    throw new Error('Failed to fetch URL content')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SummarizeRequest

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    let contentToSummarize = body.text || ''

    if (body.url) {
      contentToSummarize = await fetchUrlContent(body.url)
    }

    if (!contentToSummarize) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      )
    }

    const summaryPrompt = `Please provide a comprehensive 20-page summary of the following content, organized with:
1. Executive Summary (2 pages)
2. Key Concepts (5 pages)
3. Detailed Breakdown (8 pages)
4. Conclusion (5 pages)

Content to summarize:
${contentToSummarize}

Format the response with clear section headers and bullet points.`

    const exercisesPrompt = `Based on this content, generate 5 practical exercises:
${contentToSummarize}

For each exercise, provide:
- Exercise title
- Description
- Expected outcome

Format as JSON array with objects containing: title, description, outcome`

    const [summaryResponse, exercisesResponse] = await Promise.all([
      anthropic.messages.create({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 4000,
        messages: [{ role: 'user', content: summaryPrompt }],
      }),
      anthropic.messages.create({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 1500,
        messages: [{ role: 'user', content: exercisesPrompt }],
      }),
    ])

    const summaryText =
      summaryResponse.content[0].type === 'text' ? summaryResponse.content[0].text : ''
    let exercises = []

    if (exercisesResponse.content[0].type === 'text') {
      try {
        const jsonMatch = exercisesResponse.content[0].text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          exercises = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        exercises = []
      }
    }

    const title = body.url ? new URL(body.url).hostname : 'Text Summary'

    const { data: summary, error: summaryError } = await supabase
      .from('summaries')
      .insert({
        user_id: body.userId,
        title,
        content: summaryText,
        source_url: body.url || null,
      })
      .select()
      .single()

    if (summaryError) {
      console.error('Supabase error:', summaryError)
      return NextResponse.json(
        { error: 'Failed to save summary' },
        { status: 500 }
      )
    }

    if (exercises.length > 0 && summary) {
      await supabase.from('exercises').insert(
        exercises.map((ex: any) => ({
          summary_id: summary.id,
          exercise_text: `${ex.title}\n\n${ex.description}\n\nExpected Outcome: ${ex.outcome}`,
          completed: false,
        }))
      )
    }

    return NextResponse.json({
      id: summary.id,
      title,
      summary: summaryText,
      exercises,
      source_url: body.url || null,
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to summarize content' },
      { status: 500 }
    )
  }
}
