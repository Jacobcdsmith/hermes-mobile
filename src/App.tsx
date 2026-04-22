import { useState, useEffect } from 'react'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import History from './pages/History'
import { loadConfig, loadHistory, loadModel } from './lib/storage'
import { checkHealth } from './lib/hermes'
import type { HermesConfig } from './lib/hermes'
import type { Conversation } from './lib/storage'

type Page = 'chat' | 'settings' | 'history'

export default function App() {
  const [page, setPage] = useState<Page>('chat')
  const [config, setConfig] = useState<HermesConfig>(loadConfig)
  const [online, setOnline] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(loadHistory)
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [model, setModel] = useState(loadModel)

  // Health check polling
  useEffect(() => {
    if (!config.host) { setOnline(false); return }
    let alive = true
    const poll = async () => {
      const ok = await checkHealth(config)
      if (alive) setOnline(ok)
    }
    poll()
    const id = setInterval(poll, 10000)
    return () => { alive = false; clearInterval(id) }
  }, [config])

  const needsSetup = !config.host

  return (
    <div className="h-full flex flex-col bg-hermes-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-hermes-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-hermes-green font-bold text-lg">&gt;_</span>
          <span className="font-bold text-lg tracking-wider">HERMES</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-hermes-green pulse-green' : 'bg-red-500'}`} />
          <span className="text-xs text-hermes-muted uppercase">{online ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {needsSetup ? (
          <Settings config={config} setConfig={setConfig} onBack={() => {}} showBack={false} />
        ) : page === 'chat' ? (
          <Chat
            config={config}
            online={online}
            conversations={conversations}
            setConversations={setConversations}
            activeConvo={activeConvo}
            setActiveConvo={setActiveConvo}
            model={model}
            setModel={setModel}
          />
        ) : page === 'settings' ? (
          <Settings config={config} setConfig={setConfig} onBack={() => setPage('chat')} showBack={true} />
        ) : (
          <History
            conversations={conversations}
            setConversations={setConversations}
            onSelect={(id) => { setActiveConvo(id); setPage('chat') }}
            onBack={() => setPage('chat')}
          />
        )}
      </main>

      {/* Bottom Nav */}
      {!needsSetup && (
        <nav className="flex border-t border-hermes-border shrink-0">
          {([
            ['chat', 'Chat', '💬'],
            ['history', 'History', '📋'],
            ['settings', 'Settings', '⚙️'],
          ] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setPage(key as Page)}
              className={`flex-1 py-3 text-center text-xs uppercase tracking-wider transition-colors ${
                page === key
                  ? 'text-hermes-green border-t-2 border-hermes-green -mt-[2px]'
                  : 'text-hermes-muted'
              }`}
            >
              <div className="text-lg">{icon}</div>
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
