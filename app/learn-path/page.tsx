'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function LearnPathPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [goal, setGoal] = useState('')
  const [timeframe, setTimeframe] = useState('flexible')
  const [loading, setLoading] = useState(false)
  const [curriculum, setCurriculum] = useState<any>(null)
  const [error, setError] = useState('')
  const [paths, setPaths] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
        loadPaths(user.id)
      }
    }

    checkAuth()
  }, [router])

  const loadPaths = async (userId: string) => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('learning_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setPaths(data || [])
  }

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCurriculum(null)

    try {
      const response = await fetch('/api/learn-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          timeframe,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate learning path')
      }

      setCurriculum(data)
      setGoal('')
      loadPaths(user.id)
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning path')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Create Learning Path
          </h1>
          <p className="text-lg text-slate-600">
            Define your learning goal and get a personalized curriculum
          </p>
        </div>

        <form onSubmit={handleCreatePath} className="card p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What do you want to learn?
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="input-base"
                placeholder="e.g., Advanced Python for Machine Learning"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="input-base"
              >
                <option value="flexible">Flexible (learn at your own pace)</option>
                <option value="1month">1 Month</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
              </select>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !goal}
              className="button-primary w-full disabled:opacity-50"
            >
              {loading ? 'Generating Curriculum...' : 'Generate Learning Path'}
            </button>
          </div>
        </form>

        {curriculum && (
          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Curriculum: {curriculum.goal}
            </h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700 mb-6">
              {curriculum.curriculum}
            </div>
            <div className="p-4 bg-slate-100 rounded-lg text-sm text-slate-700">
              <strong>Status:</strong> In Progress — Follow this curriculum and track your
              progress as you complete each module.
            </div>
          </div>
        )}

        {paths.length > 0 && (
          <div className="card p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Your Learning Paths
            </h3>
            <div className="space-y-4">
              {paths.map((path) => (
                <div
                  key={path.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{path.goal}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        path.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : path.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {path.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Created {new Date(path.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
