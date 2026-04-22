import { useState } from 'react'
import { HermesConfig, checkHealth } from '../lib/hermes'
import { saveConfig } from '../lib/storage'

interface Props {
  config: HermesConfig
  setConfig: (c: HermesConfig) => void
  onBack: () => void
  showBack: boolean
}

export default function Settings({ config, setConfig, onBack, showBack }: Props) {
  const [host, setHost] = useState(config.host)
  const [port, setPort] = useState(config.port)
  const [token, setToken] = useState(config.token)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)

  const save = () => {
    const cfg = { host, port, token }
    saveConfig(cfg)
    setConfig(cfg)
    if (showBack) onBack()
  }

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    const ok = await checkHealth({ host, port, token })
    setTestResult(ok)
    setTesting(false)
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      {showBack && (
        <button onClick={onBack} className="text-hermes-green text-sm mb-4">&larr; Back</button>
      )}

      <h2 className="text-hermes-green font-bold text-lg mb-1 tracking-wider">
        {showBack ? 'SETTINGS' : 'CONFIGURE NODE'}
      </h2>
      <p className="text-hermes-muted text-xs mb-6">
        {showBack ? 'Update your Hermes connection.' : 'Enter your Hermes host IP to connect.'}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-hermes-muted uppercase mb-1">Host IP</label>
          <input
            type="text"
            value={host}
            onChange={e => setHost(e.target.value)}
            placeholder="192.168.1.100"
            className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-hermes-muted uppercase mb-1">Port</label>
          <input
            type="text"
            value={port}
            onChange={e => setPort(e.target.value)}
            placeholder="8765"
            className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
          />
        </div>

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

        <div className="flex gap-3 pt-2">
          <button
            onClick={test}
            disabled={!host || testing}
            className="flex-1 py-2.5 rounded border border-hermes-border text-hermes-muted text-sm uppercase tracking-wider hover:border-hermes-green hover:text-hermes-green transition-colors disabled:opacity-40"
          >
            {testing ? 'Testing...' : 'Test'}
          </button>
          <button
            onClick={save}
            disabled={!host}
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
