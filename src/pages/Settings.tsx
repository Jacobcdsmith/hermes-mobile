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
    <div className="h-full overflow-y-auto p-4 font-mono">
      {showBack && (
        <button onClick={onBack} className="text-hermes-green text-xs uppercase tracking-widest mb-4 hover:opacity-80">← Back</button>
      )}

      <h2 className="text-hermes-green font-bold text-lg mb-1 tracking-wider">
        {showBack ? 'SETTINGS' : 'CONFIGURE NODE'}
      </h2>
      <p className="text-hermes-muted text-xs mb-6">
        {showBack ? 'Update your connection settings.' : 'Choose a provider and connect.'}
      </p>

      {/* Provider selector */}
      <div className="mb-5">
        <label className="block text-[10px] text-hermes-muted uppercase tracking-widest mb-2">Provider</label>
        <div className="flex gap-2">
          {(['hermes', 'lmstudio'] as Provider[]).map(p => (
            <button
              key={p}
              onClick={() => switchProvider(p)}
              className={`flex-1 py-2 rounded text-xs font-mono uppercase tracking-widest border transition-colors ${
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
          <label className="block text-[10px] text-hermes-muted uppercase tracking-widest mb-1.5">
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
          <label className="block text-[10px] text-hermes-muted uppercase tracking-widest mb-1.5">Port</label>
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
            <label className="block text-[10px] text-hermes-muted uppercase tracking-widest mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="lm-studio"
              className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
            />
            <p className="text-hermes-muted/60 text-[10px] mt-1.5 leading-relaxed">
              Set in LM Studio → Developer → API Key. Leave blank to use default.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-[10px] text-hermes-muted uppercase tracking-widest mb-1.5">Bearer Token</label>
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
            className="flex-1 py-2.5 rounded border border-hermes-border text-hermes-muted text-xs uppercase tracking-widest hover:border-hermes-green hover:text-hermes-green transition-colors disabled:opacity-40"
          >
            {testing ? 'Testing...' : 'Test'}
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded bg-hermes-green text-black font-bold text-xs uppercase tracking-widest hover:bg-green-400 transition-colors disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {testResult !== null && (
          <div className={`text-center text-xs py-2 rounded font-mono uppercase tracking-widest ${testResult ? 'text-hermes-green bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {testResult ? '✓ Connection successful' : '✗ Connection failed'}
          </div>
        )}

        {/* Connection tips */}
        <div className="mt-4 p-3 rounded border border-hermes-border/50 bg-hermes-surface">
          <div className="text-[10px] text-hermes-muted uppercase tracking-widest mb-2">Connection Tips</div>
          {provider === 'lmstudio' ? (
            <ul className="space-y-1.5 text-[10px] text-hermes-muted/70 leading-relaxed">
              <li>► Open LM Studio and load a model.</li>
              <li>► Go to the Developer tab and start the local server.</li>
              <li>► Use <span className="text-hermes-green/80">localhost</span> if on the same machine, or the machine's local IP otherwise.</li>
              <li>► Default port is <span className="text-hermes-green/80">1234</span>.</li>
            </ul>
          ) : (
            <ul className="space-y-1.5 text-[10px] text-hermes-muted/70 leading-relaxed">
              <li>► Both devices must be on the same Wi-Fi network.</li>
              <li>► Find the node's IP in its network settings.</li>
              <li>► Default port is <span className="text-hermes-green/80">8765</span>.</li>
              <li>► Bearer token must match what the node is configured with.</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
