'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function SynthesisPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [synthesis, setSynthesis] = useState<any>(null)
  const [error, setError] = useState('')
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
        loadReports(user.id)
      }
    }

    checkAuth()
  }, [router])

  const loadReports = async (userId: string) => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('synthesis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setReports(data || [])
  }

  const handleGenerateSynthesis = async () => {
    setLoading(true)
    setError('')
    setSynthesis(null)

    try {
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate synthesis')
      }

      setSynthesis(data)
      loadReports(user.id)
    } catch (err: any) {
      setError(err.message || 'Failed to generate synthesis')
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
            Weekly Synthesis Report
          </h1>
          <p className="text-lg text-slate-600">
            AI-synthesized summary of your learning and actionable takeaways
          </p>
        </div>

        <div className="card p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Generate This Week's Report
            </h2>
            <button
              onClick={handleGenerateSynthesis}
              disabled={loading}
              className="button-primary disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>

          <p className="text-slate-600 mb-6">
            The synthesis will review all your summaries, exercises, and progress
            from this week and generate a comprehensive report with actionable
            takeaways.
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {synthesis && (
          <div className="space-y-8 mb-12">
            <div className="card p-8 bg-gradient-to-br from-slate-50 to-white">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Week {synthesis.week} Summary
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Based on {synthesis.topicsLearned} summaries analyzed
              </p>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700 mb-6">
                {synthesis.summary}
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Actionable Takeaways
              </h3>
              <div className="space-y-4">
                {synthesis.takeaways.map((takeaway: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 bg-slate-50 rounded-lg border-l-4 border-slate-900"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 pt-0.5">{takeaway}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {reports.length > 0 && (
          <div className="card p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Past Reports
            </h3>
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">Week {report.week}</h4>
                    <span className="text-sm text-slate-600">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                    {report.summary_text}
                  </p>
                  {report.takeaways && report.takeaways.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {report.takeaways.slice(0, 2).map((takeaway: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                        >
                          {takeaway}
                        </span>
                      ))}
                      {report.takeaways.length > 2 && (
                        <span className="text-xs text-slate-600">
                          +{report.takeaways.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
