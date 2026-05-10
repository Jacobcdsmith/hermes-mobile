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
      <div className="flex items-center justify-between px-4 py-3 border-b border-hermes-border shrink-0 bg-hermes-dark">
        <button onClick={onBack} className="text-hermes-green text-xs uppercase tracking-widest font-mono hover:opacity-80">← Back</button>
        <h2 className="text-xs font-bold uppercase tracking-widest font-mono">History</h2>
        {conversations.length > 0 && (
          <button onClick={clearAll} className="text-red-400 text-[10px] uppercase tracking-widest font-mono hover:opacity-80">Clear</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="text-hermes-muted text-[10px] uppercase tracking-widest font-mono">No transmissions logged</div>
            <div className="text-hermes-muted/40 text-[10px] font-mono flex items-center gap-1 uppercase tracking-widest">
              Start a chat to begin
              <span className="inline-block w-1.5 h-3 bg-hermes-muted/40 cursor-blink" />
            </div>
          </div>
        ) : (
          conversations.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-hermes-border/50 hover:bg-hermes-surface transition-colors text-left group"
            >
              <div className="flex-1 min-w-0 mr-3">
                <div className="text-xs text-white truncate font-mono">{c.title}</div>
                <div className="text-[10px] text-hermes-muted mt-0.5 font-mono uppercase tracking-wider">
                  {c.messages.length} msg · {formatTime(c.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => deleteConvo(c.id, e)}
                className="text-hermes-border hover:text-red-400 text-xs shrink-0 transition-colors"
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
