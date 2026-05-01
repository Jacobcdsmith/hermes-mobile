import { useState } from 'react'
import { HermesConfig, Provider, checkHealth } from '../lib/hermes'
import { saveConfig } from '../lib/storage'

interface Props {
  config: HermesConfig
  setConfig: (c: HermesConfig) => void
  onBack: () => void
  showBack: boolean
}

const PROVIDER_DEFAULTS: Record<Provider, Pick<HermesConfig, 'host' | 'port'>> = {
  hermes:   { host: '', port: '8765' },
  lmstudio: { host: 'localhost', port: '1234' },
}

export default function Settings({ config, setConfig, onBack, showBack }: Props) {
  const [provider, setProvider] = useState<Provider>(config.provider)
  const [host, setHost] = useState(config.host)
  const [port, setPort] = useState(config.port)
  const [token, setToken] = useState(config.token)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)

  const switchProvider = (p: Provider) => {
    setProvider(p)
    setTestResult(null)
    const defaults = PROVIDER_DEFAULTS[p]
    // Only reset host/port to defaults if switching providers and host matches the old default
    if (host === PROVIDER_DEFAULTS[provider].host) setHost(defaults.host)
    if (port === PROVIDER_DEFAULTS[provider].port) setPort(defaults.port)
  }

  const resolvedHost = provider === 'lmstudio' ? (host || 'localhost') : host
  const currentConfig = (): HermesConfig => ({ provider, host: resolvedHost, port, token, apiKey })

  const save = () => {
    const cfg = currentConfig()
    saveConfig(cfg)
    setConfig(cfg)
    if (showBack) onBack()
  }

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    const ok = await checkHealth(currentConfig())
    setTestResult(ok)
    setTesting(false)
  }

  const canSave = provider === 'lmstudio' ? true : !!host

  return (
    <div className="h-full overflow-y-auto p-4">
      {showBack && (
        <button onClick={onBack} className="text-hermes-green text-sm mb-4">&larr; Back</button>
      )}

      <h2 className="text-hermes-green font-bold text-lg mb-1 tracking-wider">
        {showBack ? 'SETTINGS' : 'CONFIGURE NODE'}
      </h2>
      <p className="text-hermes-muted text-xs mb-6">
        {showBack ? 'Update your connection settings.' : 'Choose a provider and connect.'}
      </p>

      {/* Provider selector */}
      <div className="mb-5">
        <label className="block text-xs text-hermes-muted uppercase mb-2">Provider</label>
        <div className="flex gap-2">
          {(['hermes', 'lmstudio'] as Provider[]).map(p => (
            <button
              key={p}
              onClick={() => switchProvider(p)}
              className={`flex-1 py-2 rounded text-sm font-mono uppercase tracking-wider border transition-colors ${
                provider === p
                  ? 'bg-hermes-green text-black border-hermes-green font-bold'
                  : 'bg-hermes-surface border-hermes-border text-hermes-muted hover:border-hermes-green hover:text-hermes-green'
              }`}
            >
              {p === 'lmstudio' ? 'LM Studio' : 'Hermes'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-hermes-muted uppercase mb-1">
            {provider === 'lmstudio' ? 'Host' : 'Host IP'}
          </label>
          <input
            type="text"
            value={host}
            onChange={e => setHost(e.target.value)}
            placeholder={PROVIDER_DEFAULTS[provider].host || '192.168.1.100'}
            className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-hermes-muted uppercase mb-1">Port</label>
          <input
            type="text"
            value={port}
            onChange={e => setPort(e.target.value)}
            placeholder={PROVIDER_DEFAULTS[provider].port}
            className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
          />
        </div>

        {provider === 'lmstudio' ? (
          <div>
            <label className="block text-xs text-hermes-muted uppercase mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="lm-studio"
              className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
            />
            <p className="text-hermes-muted text-xs mt-1">
              Set in LM Studio &rarr; Developer &rarr; API Key. Leave blank to use default.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-hermes-muted uppercase mb-1">Bearer Token</label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="jacob-local-key"
              className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={test}
            disabled={!resolvedHost || testing}
            className="flex-1 py-2.5 rounded border border-hermes-border text-hermes-muted text-sm uppercase tracking-wider hover:border-hermes-green hover:text-hermes-green transition-colors disabled:opacity-40"
          >
            {testing ? 'Testing...' : 'Test'}
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded bg-hermes-green text-black font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-colors disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {testResult !== null && (
          <div className={`text-center text-sm py-2 rounded ${testResult ? 'text-hermes-green bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {testResult ? '✓ Connection successful' : '✗ Connection failed'}
          </div>
        )}
      </div>
    </div>
  )
}
