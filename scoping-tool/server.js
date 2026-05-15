const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { WebSocketServer } = require('ws')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// roomCode → { clients: Map<clientId, { ws, name, observer }>, state, createdAt }
const rooms = new Map()

function broadcastTo(room, data, excludeId) {
  const msg = JSON.stringify(data)
  room.clients.forEach(({ ws }, id) => {
    if (id !== excludeId && ws.readyState === 1) ws.send(msg)
  })
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

function roomSummary(code, room) {
  const participants = []
  room.clients.forEach(({ name, observer }) => participants.push({ name, observer }))
  return {
    code,
    participants,
    createdAt: room.createdAt,
    problemId: room.state?.problemId ?? null,
    currentStep: room.state?.currentStep ?? null,
  }
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(body))
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsed = parse(req.url, true)
    const path = parsed.pathname ?? ''

    // ── Room API ────────────────────────────────────────────────────────────
    if (path === '/api/rooms' && req.method === 'GET') {
      const list = Array.from(rooms.entries()).map(([code, room]) => roomSummary(code, room))
      return json(res, 200, list)
    }

    if (path.startsWith('/api/rooms/') && req.method === 'DELETE') {
      const code = path.split('/')[3]
      const room = rooms.get(code)
      if (!room) return json(res, 404, { error: 'Not found' })
      room.clients.forEach(({ ws }) => { try { ws.close() } catch {} })
      rooms.delete(code)
      return json(res, 200, { ok: true })
    }

    handle(req, res, parsed)
  })

  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname !== '/ws') return
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
  })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    const code = url.searchParams.get('room')
    if (!code) { ws.close(); return }

    const clientId = randomId()
    if (!rooms.has(code)) rooms.set(code, { clients: new Map(), state: null, createdAt: Date.now() })
    const room = rooms.get(code)
    room.clients.set(clientId, { ws, name: 'Anonymous', observer: false })

    const payload = { type: 'init', state: room.state, users: [] }
    room.clients.forEach(({ name, observer }, id) => {
      if (id !== clientId) payload.users.push({ id, name, observer })
    })
    ws.send(JSON.stringify(payload))

    ws.on('message', raw => {
      try {
        const { type, data } = JSON.parse(raw)
        if (type === 'update') {
          room.state = data
          broadcastTo(room, { type: 'state', data }, clientId)
        } else if (type === 'join') {
          const client = room.clients.get(clientId)
          client.name = data.name
          client.observer = !!data.observer
          broadcastTo(room, { type: 'presence', event: 'join', id: clientId, name: data.name, observer: client.observer }, clientId)
        } else if (type === 'cursor') {
          broadcastTo(room, { type: 'cursor', id: clientId, name: data.name, x: data.x, y: data.y, observer: data.observer }, clientId)
        }
      } catch {}
    })

    ws.on('close', () => {
      room.clients.delete(clientId)
      broadcastTo(room, { type: 'presence', event: 'leave', id: clientId }, null)
      if (room.clients.size === 0) {
        setTimeout(() => {
          if (rooms.get(code)?.clients.size === 0) rooms.delete(code)
        }, 4 * 60 * 60 * 1000)
      }
    })
  })

  const port = process.env.PORT || 3000
  server.listen(port, () => console.log(`> Ready on http://localhost:${port}`))
})
