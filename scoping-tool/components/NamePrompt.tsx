'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  code: string
  onConfirm: (name: string) => void
}

const STORAGE_KEY = 'msaid-participant-name'

export default function NamePrompt({ code, onConfirm }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) { onConfirm(saved); return }
    inputRef.current?.focus()
  }, [onConfirm])

  const submit = () => {
    const name = value.trim()
    if (!name) return
    sessionStorage.setItem(STORAGE_KEY, name)
    onConfirm(name)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">What&apos;s your name?</h2>
        <p className="text-sm text-slate-500 mb-6">
          Your teammates will see your cursor and name in real time.
          <br />
          <span className="font-mono text-xs text-slate-400">Team: {code}</span>
        </p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="e.g. Dhiyaa"
          maxLength={24}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent mb-4"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
        >
          Join team
        </button>
      </div>
    </div>
  )
}

export function getStoredName(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(STORAGE_KEY)
}
