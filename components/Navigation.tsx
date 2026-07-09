'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function Navigation() {
  const router = useRouter()
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

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-bold text-slate-900">
          Learning System
        </Link>

        {!loading && (
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex gap-2">
                  <Link href="/summarize" className="text-slate-600 hover:text-slate-900">
                    Summarize
                  </Link>
                  <Link href="/learn-path" className="text-slate-600 hover:text-slate-900">
                    Learning Path
                  </Link>
                  <Link href="/progress" className="text-slate-600 hover:text-slate-900">
                    Progress
                  </Link>
                  <Link href="/synthesis" className="text-slate-600 hover:text-slate-900">
                    Weekly Report
                  </Link>
                </div>
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                  <span className="text-sm text-slate-600">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth" className="text-slate-600 hover:text-slate-900">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
