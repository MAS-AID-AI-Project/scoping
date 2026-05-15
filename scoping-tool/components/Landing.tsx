'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Users, LogIn } from 'lucide-react'

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function Landing() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')

  const createTeam = () => {
    const code = genCode()
    router.push(`/room/${code}`)
  }

  const joinTeam = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 4) { setJoinError('Enter the team code your instructor or teammate shared.'); return }
    router.push(`/room/${code}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3">MSAID</p>
          <h1 className="text-4xl font-semibold text-slate-900 mb-3">AI Scoping Tool</h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Work through a real-world problem with your team — from vague challenge to a structured AI briefing document.
          </p>
        </div>

        {/* Create team */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Create a new team</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            You&apos;ll get a short team code to share with your group. Everyone who joins the same code works on the same document in real time.
          </p>
          <button
            onClick={createTeam}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
          >
            Create team <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Join team */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
              <LogIn className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Join an existing team</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
              onKeyDown={e => e.key === 'Enter' && joinTeam()}
              placeholder="Team code (e.g. X7KQ2A)"
              maxLength={8}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent uppercase tracking-widest"
            />
            <button
              onClick={joinTeam}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Join
            </button>
          </div>
          {joinError && <p className="text-xs text-rose-500 mt-2">{joinError}</p>}
        </div>

        {/* Instructor links */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>
            Instructor?{' '}
            <a href="/prefilled" className="text-indigo-500 hover:text-indigo-700 underline underline-offset-2">
              Open the worked example
            </a>
            {' '}·{' '}
            <a href="/manage" className="text-indigo-500 hover:text-indigo-700 underline underline-offset-2">
              Manage rooms
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
