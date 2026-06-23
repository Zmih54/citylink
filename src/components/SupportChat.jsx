import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Loader2, Headset } from 'lucide-react'
import { hasSupabase } from '../lib/supabase.js'
import { webChatSend, webChatPoll } from '../lib/api.js'

const ID_KEY = 'citylink-webchat-id'
const POLL_MS = 4000

function getChatId() {
  let id = localStorage.getItem(ID_KEY)
  if (!id) {
    id = (crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2))
    localStorage.setItem(ID_KEY, id)
  }
  return id
}

const GREETING = {
  role: 'assistant',
  content: 'Вітаю! Я віртуальний помічник CityLink 👋 Запитайте про тарифи, оплату чи підключення. Складні питання передам оператору.',
  _local: true,
}

export default function SupportChat() {
  if (!hasSupabase) return null
  return <SupportChatInner />
}

function SupportChatInner() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatId = useRef(null)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  const refresh = async () => {
    const id = chatId.current
    if (!id) return
    const server = await webChatPoll(id)
    if (server.length) setMessages(server)
  }

  // Open: init id, load history, start polling.
  useEffect(() => {
    if (!open) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }
    if (!chatId.current) chatId.current = getChatId()
    refresh()
    pollRef.current = setInterval(refresh, POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)
    // optimistic
    setMessages((m) => [...m.filter((x) => !x._local), { role: 'user', content: text, _temp: true }])
    try {
      await webChatSend(chatId.current, text)
      await refresh()
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Не вдалося надіслати. Спробуйте ще раз або зателефонуйте +38 (066) 026-10-75.', _local: true }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Чат підтримки"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow transition hover:brightness-110 hover:-translate-y-0.5"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] max-h-[80vh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Headset className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-white">Підтримка CityLink</div>
              <div className="text-xs text-emerald-300">● Онлайн</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => {
              const mine = m.role === 'user'
              const isOperator = m.role === 'operator'
              return (
                <div key={m.id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? 'bg-brand-500/90 text-white'
                      : 'border border-white/10 bg-white/5 text-slate-200'
                  }`}>
                    {isOperator && <div className="mb-0.5 text-xs font-semibold text-brand-300">🧑‍💼 Оператор</div>}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              )
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> друкує…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              className="input py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишіть повідомлення…"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0 px-3 py-2 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
