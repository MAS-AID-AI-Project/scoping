'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Trash2, Eye, Users, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Participant { name: string; observer: boolean }
interface Room {
  code: string
  participants: Participant[]
  createdAt: number
  problemId: string | null
  currentStep: number | null
}

const DOMAIN_LABEL: Record<string, string> = {
  healthcare: 'Healthcare',
  finance: 'Finance',
  services: 'Services',
  custom: 'Custom',
}

const STEP_LABEL: Record<number, string> = {
  1: 'Problem Definition',
  2: 'Success Metrics',
  3: 'Solution Space',
  4: 'Feasibility',
  5: 'Final Document',
}

function elapsed(ms: number) {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function ManagePage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      setRooms(data)
      setLastRefresh(Date.now())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRooms()
    const id = setInterval(fetchRooms, 5000)
    return () => clearInterval(id)
  }, [fetchRooms])

  const deleteRoom = async (code: string) => {
    if (!confirm(`Close room ${code} and disconnect all participants?`)) return
    setDeleting(code)
    await fetch(`/api/rooms/${code}`, { method: 'DELETE' })
    await fetchRooms()
    setDeleting(null)
  }

  const activeParticipants = (r: Room) => r.participants.filter(p => !p.observer)
  const observers = (r: Room) => r.participants.filter(p => p.observer)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-base font-semibold text-slate-900">Room Manager</span>
            <span className="hidden sm:inline text-slate-400 text-sm">— MSAID</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Refreshes every 5s · last {elapsed(lastRefresh)}
            </span>
            <button
              onClick={fetchRooms}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium mb-1">No active rooms</p>
            <p className="text-sm text-slate-400">Rooms appear here as soon as someone creates a team.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.sort((a, b) => b.createdAt - a.createdAt).map(room => {
              const active = activeParticipants(room)
              const obs = observers(room)
              return (
                <div key={room.code} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 flex items-start gap-4">
                    {/* Code + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-mono text-xl font-bold text-slate-900 tracking-widest">
                          {room.code}
                        </span>
                        {room.problemId && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            {DOMAIN_LABEL[room.problemId] ?? room.problemId}
                          </span>
                        )}
                        {room.currentStep && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Step {room.currentStep} — {STEP_LABEL[room.currentStep]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {elapsed(room.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {active.length} participant{active.length !== 1 ? 's' : ''}
                          {obs.length > 0 && `, ${obs.length} observer${obs.length !== 1 ? 's' : ''}`}
                        </span>
                      </div>

                      {/* Participant names */}
                      {room.participants.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.participants.map((p, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${
                              p.observer
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                              {p.observer ? '👁 ' : ''}{p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/room/${room.code}?observe=true`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Monitor
                      </Link>
                      <button
                        onClick={() => deleteRoom(room.code)}
                        disabled={deleting === room.code}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting === room.code ? 'Closing…' : 'Close room'}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {room.currentStep && (
                    <div className="px-6 pb-4">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                            s <= room.currentStep! ? 'bg-indigo-500' : 'bg-slate-100'
                          }`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
