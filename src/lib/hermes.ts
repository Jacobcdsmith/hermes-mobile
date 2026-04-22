export interface HermesConfig {
  host: string
  port: string
  token: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface Model {
  id: string
  object: string
}

const getBaseUrl = (cfg: HermesConfig) => `http://${cfg.host}:${cfg.port}`

const headers = (cfg: HermesConfig) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${cfg.token}`,
})

export async function checkHealth(cfg: HermesConfig): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl(cfg)}/health`, {
      headers: headers(cfg),
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function getModels(cfg: HermesConfig): Promise<Model[]> {
  try {
    const res = await fetch(`${getBaseUrl(cfg)}/v1/models`, {
      headers: headers(cfg),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export async function* streamChat(
  cfg: HermesConfig,
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const res = await fetch(`${getBaseUrl(cfg)}/v1/chat/completions`, {
    method: 'POST',
    headers: headers(cfg),
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  })

  if (!res.ok) {
    throw new Error(`Hermes error: ${res.status}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') return

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) yield content
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function sendChat(
  cfg: HermesConfig,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(`${getBaseUrl(cfg)}/v1/chat/completions`, {
    method: 'POST',
    headers: headers(cfg),
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  })

  if (!res.ok) throw new Error(`Hermes error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
