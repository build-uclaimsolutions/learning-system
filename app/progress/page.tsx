'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function ProgressPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week')
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
        loadProgress(user.id, timeframe)
      }
    }

    checkAuth()
  }, [router])

  const loadProgress = async (userId: string, tf: typeof timeframe) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/progress?userId=${userId}&timeframe=${tf}`
      )
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error('Failed to load progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeframeChange = (tf: typeof timeframe) => {
    setTimeframe(tf)
    if (user) {
      loadProgress(user.id, tf)
    }
  }

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
            <div className="animate-spin">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full"></div>
            </div>
          </div>
          <p className="text-slate-600">Loading progress...</p>
        </div>
      </div>
    )
  }

  const stats = progress?.stats || {}

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Your Learning Progress
          </h1>
          <p className="text-lg text-slate-600">
            Track your growth and celebrate milestones
          </p>
        </div>

        <div className="card p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Statistics</h2>
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {tf === 'week'
                    ? 'This Week'
                    : tf === 'month'
                    ? 'This Month'
                    : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="text-sm text-slate-600 mb-1">Topics Learned</div>
              <div className="text-4xl font-bold text-slate-900">
                {stats.totalTopicsLearned || 0}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="text-sm text-slate-600 mb-1">Exercises Done</div>
              <div className="text-4xl font-bold text-slate-900">
                {stats.exercisesCompleted || 0}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="text-sm text-slate-600 mb-1">Exercise Rate</div>
              <div className="text-4xl font-bold text-slate-900">
                {stats.totalExercises > 0
                  ? Math.round((stats.exercisesCompleted / stats.totalExercises) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
              <div className="text-sm text-slate-600 mb-1">Summaries Created</div>
              <div className="text-4xl font-bold text-slate-900">
                {stats.summariesCreated || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Topics Learned
          </h3>
          {progress?.progress && progress.progress.length > 0 ? (
            <div className="space-y-4">
              {progress.progress.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{item.topic}</h4>
                    <p className="text-sm text-slate-600">
                      Level: {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                    </p>
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(item.completed_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No learning activity yet</p>
              <button
                onClick={() => router.push('/summarize')}
                className="button-primary"
              >
                Start Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
