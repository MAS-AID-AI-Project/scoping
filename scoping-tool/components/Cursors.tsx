'use client'

import { useEffect, useState } from 'react'
import type { RemoteCursor } from '@/lib/sync'

const COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#8b5cf6', // violet
  '#14b8a6', // teal
]

function colorForId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return COLORS[Math.abs(hash) % COLORS.length]
}

interface Props {
  cursors: Record<string, RemoteCursor>
}

const FADE_AFTER = 4000  // ms

export default function Cursors({ cursors }: Props) {
  const [, tick] = useState(0)

  // Re-render every second to update opacity as cursors age
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const now = Date.now()

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      {Object.values(cursors).map(cursor => {
        const age = now - cursor.lastSeen
        if (age > FADE_AFTER + 1000) return null
        const opacity = age > FADE_AFTER ? 0 : age > FADE_AFTER * 0.6 ? 1 - (age - FADE_AFTER * 0.6) / (FADE_AFTER * 0.4) : 1
        const color = cursor.observer ? '#f59e0b' : colorForId(cursor.id)
        return (
          <div
            key={cursor.id}
            style={{
              position: 'fixed',
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
              opacity,
              transition: 'opacity 0.4s, left 0.05s linear, top 0.05s linear',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 2L16 9.5L10.5 11L8 17L4 2Z"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div
              style={{
                marginLeft: 14,
                marginTop: -6,
                background: color,
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'system-ui, sans-serif',
                padding: '2px 7px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              {cursor.observer ? '👁 ' : ''}{cursor.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
