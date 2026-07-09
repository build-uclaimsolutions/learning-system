'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Dashboard from '@/components/Dashboard'
import { getSupabaseClient } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkAuth()
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
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Learning System
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            AI-powered learning platform. Summarize articles, generate learning paths, and track your progress.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth" className="button-primary">
              Sign In
            </Link>
            <Link href="/auth" className="button-secondary">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
