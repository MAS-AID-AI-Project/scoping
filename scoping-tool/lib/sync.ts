'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { TeamState } from './types'

export interface RemoteCursor {
  id: string
  name: string
  x: number  // normalised 0–1
  y: number
  lastSeen: number
  observer?: boolean
}

interface Handlers {
  onState: (state: TeamState) => void
  onCursor: (id: string, cursor: Omit<RemoteCursor, 'id'> | null) => void
}

interface SyncAPI {
  pushState: (state: TeamState) => void
  pushCursor: (name: string, x: number, y: number, observer?: boolean) => void
  announce: (name: string, observer?: boolean) => void
}

export function useRoomSync(code: string, handlers: Handlers): SyncAPI {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${window.location.host}/ws?room=${code}`)
    wsRef.current = ws

    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'init') {
          if (msg.state) handlersRef.current.onState(msg.state)
          // Existing users are available but we don't need to render cursors for them until they move
        } else if (msg.type === 'state') {
          handlersRef.current.onState(msg.data)
        } else if (msg.type === 'cursor') {
          handlersRef.current.onCursor(msg.id, { name: msg.name, x: msg.x, y: msg.y, lastSeen: Date.now(), observer: msg.observer })
        } else if (msg.type === 'presence' && msg.event === 'leave') {
          handlersRef.current.onCursor(msg.id, null)
        }
      } catch {}
    }

    ws.onclose = () => {
      reconnectRef.current = setTimeout(connect, 2000)
    }
  }, [code])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const pushState = useCallback((state: TeamState) => {
    send({ type: 'update', data: state })
  }, [send])

  const pushCursor = useCallback((name: string, x: number, y: number, observer = false) => {
    send({ type: 'cursor', data: { name, x, y, observer } })
  }, [send])

  const announce = useCallback((name: string, observer = false) => {
    send({ type: 'join', data: { name, observer } })
  }, [send])

  return { pushState, pushCursor, announce }
}
