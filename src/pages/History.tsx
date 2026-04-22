import { Conversation, saveHistory } from '../lib/storage'

interface Props {
  conversations: Conversation[]
  setConversations: (c: Conversation[]) => void
  onSelect: (id: string) => void
  onBack: () => void
}

export default function History({ conversations, setConversations, onSelect, onBack }: Props) {
  const deleteConvo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = conversations.filter(c => c.id !== id)
    setConversations(updated)
    saveHistory(updated)
  }

  const clearAll = () => {
    setConversations([])
    saveHistory([])
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-hermes-border shrink-0">
        <button onClick={onBack} className="text-hermes-green text-sm">&larr; Back</button>
        <h2 className="text-sm font-bold uppercase tracking-wider">History</h2>
        {conversations.length > 0 && (
          <button onClick={clearAll} className="text-red-400 text-xs uppercase">Clear</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-hermes-muted text-sm">
            No conversations yet
          </div>
        ) : (
          conversations.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-hermes-border/50 hover:bg-hermes-surface transition-colors text-left"
            >
              <div className="flex-1 min-w-0 mr-3">
                <div className="text-sm text-white truncate">{c.title}</div>
                <div className="text-xs text-hermes-muted mt-0.5">
                  {c.messages.length} messages · {formatTime(c.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => deleteConvo(c.id, e)}
                className="text-hermes-muted hover:text-red-400 text-xs shrink-0"
              >
                ✕
              </button>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
