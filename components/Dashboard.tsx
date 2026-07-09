'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        const weekRes = await fetch(
          `/api/progress?userId=${user.id}&timeframe=week`
        )
        const weekData = await weekRes.json()

        const { data: summaries } = await supabase
          .from('summaries')
          .select('id')
          .eq('user_id', user.id)

        const { data: goals } = await supabase
          .from('learning_goals')
          .select('id, status')
          .eq('user_id', user.id)

        setStats({
          summariesThisWeek: weekData.stats?.summariesCreated || 0,
          topicsLearned: weekData.stats?.totalTopicsLearned || 0,
          exercisesCompleted: weekData.stats?.exercisesCompleted || 0,
          totalSummaries: summaries?.length || 0,
          activeGoals: goals?.filter((g) => g.status === 'in_progress').length || 0,
        })
      }

      setLoading(false)
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
            <div className="animate-spin">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full"></div>
            </div>
          </div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-lg text-slate-600">
          Your personalized learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">This Week</div>
          <div className="text-3xl font-bold text-slate-900">
            {stats?.summariesThisWeek || 0}
          </div>
          <div className="text-xs text-slate-500">Summaries</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Topics Learned</div>
          <div className="text-3xl font-bold text-slate-900">
            {stats?.topicsLearned || 0}
          </div>
          <div className="text-xs text-slate-500">This week</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Exercises</div>
          <div className="text-3xl font-bold text-slate-900">
            {stats?.exercisesCompleted || 0}
          </div>
          <div className="text-xs text-slate-500">Completed</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Total Summaries</div>
          <div className="text-3xl font-bold text-slate-900">
            {stats?.totalSummaries || 0}
          </div>
          <div className="text-xs text-slate-500">All time</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Active Goals</div>
          <div className="text-3xl font-bold text-slate-900">
            {stats?.activeGoals || 0}
          </div>
          <div className="text-xs text-slate-500">In progress</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/summarize"
          className="card p-8 hover:shadow-md hover:border-slate-300 transition-all"
        >
          <div className="text-2xl mb-2">📄</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Summarize Content
          </h2>
          <p className="text-slate-600">
            Paste a URL or text to get a comprehensive AI summary and exercises
          </p>
        </Link>

        <Link
          href="/learn-path"
          className="card p-8 hover:shadow-md hover:border-slate-300 transition-all"
        >
          <div className="text-2xl mb-2">🎯</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Create Learning Path
          </h2>
          <p className="text-slate-600">
            Define a goal and get a personalized curriculum with milestones
          </p>
        </Link>

        <Link
          href="/progress"
          className="card p-8 hover:shadow-md hover:border-slate-300 transition-all"
        >
          <div className="text-2xl mb-2">📊</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            View Progress
          </h2>
          <p className="text-slate-600">
            Track what you've learned and your overall growth
          </p>
        </Link>
      </div>

      <div className="mt-12">
        <Link
          href="/synthesis"
          className="card p-8 hover:shadow-md hover:border-slate-300 transition-all"
        >
          <div className="text-2xl mb-2">💡</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Weekly Synthesis Report
          </h2>
          <p className="text-slate-600">
            AI-generated synthesis of your week's learning with actionable takeaways
          </p>
        </Link>
      </div>
    </div>
  )
}
