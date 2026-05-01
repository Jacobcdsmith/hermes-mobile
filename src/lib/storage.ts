import { HermesConfig, ChatMessage } from './hermes'

const CONFIG_KEY = 'hermes-config'
const HISTORY_KEY = 'hermes-history'
const MODEL_KEY = 'hermes-model'

const DEFAULT_CONFIG: HermesConfig = {
  provider: 'hermes',
  host: '',
  port: '8765',
  token: 'jacob-local-key',
  apiKey: 'lm-studio',
}

export function loadConfig(): HermesConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate configs saved before provider field was added
      return { ...DEFAULT_CONFIG, ...parsed }
    }
  } catch {}
  return { ...DEFAULT_CONFIG }
}

export function saveConfig(cfg: HermesConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export function loadHistory(): Conversation[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveHistory(convos: Conversation[]) {
  // Keep max 50 conversations
  const trimmed = convos.slice(0, 50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
}

export function loadModel(): string {
  return localStorage.getItem(MODEL_KEY) || ''
}

export function saveModel(model: string) {
  localStorage.setItem(MODEL_KEY, model)
}
