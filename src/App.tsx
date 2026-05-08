import { useState, useEffect } from 'react'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import History from './pages/History'
import Tutorial from './pages/Tutorial'
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
    if (!config.host && config.provider !== 'lmstudio') { setOnline(false); return }
    let alive = true
    const poll = async () => {
      const ok = await checkHealth(config)
      if (alive) setOnline(ok)
    }
    poll()
    const id = setInterval(poll, 10000)
    return () => { alive = false; clearInterval(id) }
  }, [config])

  // LM Studio defaults to localhost so an empty host is still usable
  const needsSetup = !config.host && config.provider !== 'lmstudio'

  const handleTutorialComplete = (cfg: HermesConfig) => {
    setConfig(cfg)
  }

  return (
    <div className="h-full flex flex-col bg-hermes-dark font-mono">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-hermes-border shrink-0 bg-hermes-dark">
        <div className="flex items-center gap-2">
          <span className="text-hermes-green font-bold text-base leading-none select-none">&gt;_</span>
          <span className="font-bold text-base tracking-[0.2em] text-white">HERMES</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-hermes-green pulse-green' : 'bg-red-500'}`} />
          <span className="text-[10px] text-hermes-muted uppercase tracking-widest">
            {online ? 'NODE ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {needsSetup ? (
          <Tutorial onComplete={handleTutorialComplete} />
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
        <nav className="flex border-t border-hermes-border shrink-0 bg-hermes-dark">
          {([
            ['chat', 'Chat', '💬'],
            ['history', 'History', '📋'],
            ['settings', 'Settings', '⚙️'],
          ] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setPage(key as Page)}
              className={`flex-1 py-3 text-center text-[10px] uppercase tracking-widest transition-colors font-mono ${
                page === key
                  ? 'text-hermes-green border-t-2 border-hermes-green -mt-[2px]'
                  : 'text-hermes-muted'
              }`}
            >
              <div className="text-base">{icon}</div>
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
