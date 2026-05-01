import { useState, useRef, useEffect } from 'react'
import { HermesConfig, ChatMessage, streamChat, sendChat, getModels } from '../lib/hermes'
import { Conversation, saveHistory, saveModel } from '../lib/storage'

interface Props {
  config: HermesConfig
  online: boolean
  conversations: Conversation[]
  setConversations: (c: Conversation[]) => void
  activeConvo: string | null
  setActiveConvo: (id: string | null) => void
  model: string
  setModel: (m: string) => void
}

export default function Chat({
  config, online, conversations, setConversations,
  activeConvo, setActiveConvo, model, setModel,
}: Props) {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [streamText, setStreamText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const convo = conversations.find(c => c.id === activeConvo)
  const messages = convo?.messages || []

  // Load models on mount
  useEffect(() => {
    if (!config.host && config.provider !== 'lmstudio') return
    getModels(config).then(m => {
      const ids = m.map(x => x.id)
      setModels(ids)
      if (!model && ids.length > 0) {
        setModel(ids[0])
        saveModel(ids[0])
      }
    })
  }, [config])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  const newConvo = (): Conversation => ({
    id: crypto.randomUUID(),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  const send = async () => {
    const text = input.trim()
    if (!text || streaming || !online) return

    let current = convo
    if (!current) {
      current = newConvo()
      current.title = text.slice(0, 40)
    }

    const userMsg: ChatMessage = { role: 'user', content: text }
    const updated = { ...current, messages: [...current.messages, userMsg], updatedAt: Date.now() }

    const newConvos = [updated, ...conversations.filter(c => c.id !== updated.id)]
    setConversations(newConvos)
    setActiveConvo(updated.id)
    saveHistory(newConvos)
    setInput('')
    setStreaming(true)
    setStreamText('')

    try {
      let full = ''
      for await (const chunk of streamChat(config, model, updated.messages)) {
        full += chunk
        setStreamText(full)
      }

      const assistantMsg: ChatMessage = { role: 'assistant', content: full }
      const final = { ...updated, messages: [...updated.messages, assistantMsg], updatedAt: Date.now() }
      const finalConvos = [final, ...conversations.filter(c => c.id !== final.id)]
      setConversations(finalConvos)
      saveHistory(finalConvos)
    } catch (err) {
      // Fallback to non-streaming
      try {
        const reply = await sendChat(config, model, updated.messages)
        const assistantMsg: ChatMessage = { role: 'assistant', content: reply }
        const final = { ...updated, messages: [...updated.messages, assistantMsg], updatedAt: Date.now() }
        const finalConvos = [final, ...conversations.filter(c => c.id !== final.id)]
        setConversations(finalConvos)
        saveHistory(finalConvos)
      } catch {
        setStreamText('Error: Could not reach the server.')
      }
    }

    setStreaming(false)
    setStreamText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Model selector bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-hermes-border shrink-0">
        <select
          value={model}
          onChange={e => { setModel(e.target.value); saveModel(e.target.value) }}
          className="flex-1 bg-hermes-surface border border-hermes-border rounded px-2 py-1.5 text-xs text-white font-mono focus:border-hermes-green focus:outline-none"
        >
          {models.length === 0 && <option value="">No models found</option>}
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          onClick={() => { setActiveConvo(null) }}
          className="px-3 py-1.5 rounded border border-hermes-border text-hermes-muted text-xs hover:border-hermes-green hover:text-hermes-green transition-colors"
        >
          + New
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl text-hermes-border mb-3">🤖</div>
            <div className="text-hermes-muted text-sm uppercase tracking-widest">Hermes Node Online</div>
            <div className="text-hermes-muted/50 text-xs mt-1">Awaiting your directive...</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-hermes-green/15 text-hermes-green border border-hermes-green/30'
                : 'bg-hermes-surface text-gray-200 border border-hermes-border'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {streaming && streamText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap bg-hermes-surface text-gray-200 border border-hermes-border">
              {streamText}
              <span className="inline-block w-1.5 h-4 bg-hermes-green ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        {streaming && !streamText && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2 text-sm bg-hermes-surface border border-hermes-border">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-hermes-green animate-bounce" style={{animationDelay:'0ms'}} />
                <span className="w-1.5 h-1.5 rounded-full bg-hermes-green animate-bounce" style={{animationDelay:'150ms'}} />
                <span className="w-1.5 h-1.5 rounded-full bg-hermes-green animate-bounce" style={{animationDelay:'300ms'}} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-hermes-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={online ? 'Command Hermes...' : 'Offline — check connection'}
            disabled={!online || streaming}
            rows={1}
            className="flex-1 bg-hermes-surface border border-hermes-border rounded-lg px-3 py-2.5 text-sm text-white font-mono resize-none focus:border-hermes-green focus:outline-none disabled:opacity-40 placeholder:text-hermes-muted/50 placeholder:uppercase placeholder:tracking-wider placeholder:text-xs"
            style={{ maxHeight: '120px' }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || !online || streaming}
            className="p-2.5 rounded-lg bg-hermes-green text-black disabled:opacity-30 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="text-[10px] text-hermes-muted/40 mt-1 text-center uppercase tracking-wider">
          Shift + Enter for new line
        </div>
      </div>
    </div>
  )
}
