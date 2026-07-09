'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function SummarizePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
      }
    }

    checkAuth()
  }, [router])

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSummary(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url || undefined,
          text: text || undefined,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize')
      }

      setSummary(data)
      setUrl('')
      setText('')
    } catch (err: any) {
      setError(err.message || 'Failed to summarize content')
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
            Summarize Content
          </h1>
          <p className="text-lg text-slate-600">
            Get comprehensive summaries and exercises from any URL or text
          </p>
        </div>

        <form onSubmit={handleSummarize} className="card p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL (optional)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input-base"
                placeholder="https://example.com/article"
              />
              <p className="text-xs text-slate-500 mt-1">
                Paste the URL of an article or webpage
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">OR</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste Text (optional)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-base min-h-48 font-mono text-sm"
                placeholder="Paste the text you want to summarize here..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Copy and paste any text content
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!url && !text)}
              className="button-primary w-full disabled:opacity-50"
            >
              {loading ? 'Summarizing...' : 'Generate Summary & Exercises'}
            </button>
          </div>
        </form>

        {summary && (
          <div className="space-y-8">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {summary.title}
              </h2>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                {summary.summary}
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Exercises
              </h3>
              <div className="space-y-6">
                {summary.exercises.map((ex: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-slate-300 pl-6 py-4">
                    <h4 className="font-bold text-slate-900 mb-2">
                      {idx + 1}. {ex.title}
                    </h4>
                    <p className="text-slate-700 mb-3">{ex.description}</p>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                      <strong>Expected Outcome:</strong> {ex.outcome}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSummary(null)
                setUrl('')
                setText('')
              }}
              className="button-secondary"
            >
              Summarize Another Item
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
