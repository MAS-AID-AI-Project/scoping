'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Lock } from 'lucide-react'

const STORAGE_KEY = 'msaid_instructor_auth'
const PASSWORD = 'gouda_cheese'

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setAuthed(sessionStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  const attempt = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setAuthed(true)
    } else {
      setError(true)
    }
  }

  if (authed === null) return null

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-5">
            <Lock className="w-5 h-5 text-slate-500" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 text-center mb-1">Instructor Access</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Enter the instructor password to continue.</p>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent mb-3"
            autoFocus
          />
          {error && <p className="text-xs text-rose-500 mb-3">Incorrect password.</p>}
          <button
            onClick={attempt}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
