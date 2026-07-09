import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
)

interface ProgressQuery {
  userId: string
  timeframe?: 'week' | 'month' | 'all'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeframe = (searchParams.get('timeframe') || 'all') as 'week' | 'month' | 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)

    if (timeframe === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('completed_date', weekAgo)
    } else if (timeframe === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('completed_date', monthAgo)
    }

    const { data: progress, error } = await query.order('completed_date', {
      ascending: false,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    const { data: summaries } = await supabase
      .from('summaries')
      .select('id')
      .eq('user_id', userId)

    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, completed')
      .in('summary_id', summaries?.map((s) => s.id) || [])

    const completedExercises = exercises?.filter((e) => e.completed).length || 0
    const totalExercises = exercises?.length || 0

    return NextResponse.json({
      progress: progress || [],
      stats: {
        totalTopicsLearned: new Set(progress?.map((p) => p.topic) || []).size,
        exercisesCompleted: completedExercises,
        totalExercises: totalExercises,
        summariesCreated: summaries?.length || 0,
        timeframe,
      },
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { error } = await supabase
      .from('progress')
      .insert({
        user_id: body.userId,
        topic: body.topic,
        level: body.level || 'beginner',
        completed_date: new Date().toISOString(),
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to log progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to log progress' },
      { status: 500 }
    )
  }
}
