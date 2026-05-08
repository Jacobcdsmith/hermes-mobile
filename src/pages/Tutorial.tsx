import { useState, useEffect } from 'react'
import { HermesConfig, Provider, checkHealth } from '../lib/hermes'
import { saveConfig } from '../lib/storage'

interface Props {
  onComplete: (config: HermesConfig) => void
}

type Step = 'boot' | 'provider' | 'connect' | 'test'

const PROVIDER_DEFAULTS: Record<Provider, { host: string; port: string }> = {
  hermes:   { host: '', port: '8765' },
  lmstudio: { host: 'localhost', port: '1234' },
}

const BOOT_LINES = [
  { text: 'Initializing HERMES runtime...', delay: 0 },
  { text: 'Loading secure channel modules...', delay: 400 },
  { text: 'Verifying local storage...', delay: 800 },
  { text: 'No node configuration found.', delay: 1300 },
]

export default function Tutorial({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('boot')
  const [visibleLines, setVisibleLines] = useState(0)
  const [provider, setProvider] = useState<Provider>('hermes')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('8765')
  const [token, setToken] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)

  // Animate boot lines
  useEffect(() => {
    if (step !== 'boot') return
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    })
  }, [step])

  const resolvedHost = provider === 'lmstudio' ? (host || 'localhost') : host
  const currentConfig = (): HermesConfig => ({ provider, host: resolvedHost, port, token, apiKey })

  const selectProvider = (p: Provider) => {
    setProvider(p)
    setHost(PROVIDER_DEFAULTS[p].host)
    setPort(PROVIDER_DEFAULTS[p].port)
    setStep('connect')
  }

  const runTest = async () => {
    setTesting(true)
    setTestResult(null)
    const ok = await checkHealth(currentConfig())
    setTestResult(ok)
    setTesting(false)
  }

  const goToTest = () => {
    setStep('test')
    runTest()
  }

  const finish = () => {
    const cfg = currentConfig()
    saveConfig(cfg)
    onComplete(cfg)
  }

  const canConnect = provider === 'lmstudio' ? true : !!host.trim()

  /* ── BOOT ───────────────────────────────────────────────────── */
  if (step === 'boot') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 font-mono">
        <div className="w-full max-w-xs">
          <div className="text-hermes-green text-xs font-bold uppercase tracking-widest mb-4 opacity-60">
            HERMES // SYSTEM INIT
          </div>
          <div className="space-y-1.5 text-xs mb-8">
            {BOOT_LINES.map((line, i) => (
              <div
                key={i}
                className={`flex gap-2 transition-opacity duration-300 ${
                  visibleLines > i ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="text-hermes-green shrink-0">[OK]</span>
                <span className={i === 3 ? 'text-hermes-muted' : 'text-hermes-green/70'}>
                  {line.text}
                </span>
              </div>
            ))}
          </div>
          {visibleLines >= BOOT_LINES.length && (
            <button
              onClick={() => setStep('provider')}
              className="w-full py-2.5 rounded border border-hermes-green text-hermes-green text-sm uppercase tracking-widest hover:bg-hermes-green hover:text-black transition-colors animate-fade-in"
            >
              Configure Node →
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── PROVIDER ───────────────────────────────────────────────── */
  if (step === 'provider') {
    return (
      <div className="h-full overflow-y-auto p-5 font-mono">
        <div className="text-hermes-muted text-[10px] uppercase tracking-widest mb-1">Step 1 of 2</div>
        <h2 className="text-hermes-green font-bold text-lg tracking-wider mb-1">SELECT PROVIDER</h2>
        <p className="text-hermes-muted text-xs mb-6">
          Choose the AI backend you want to connect to.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => selectProvider('hermes')}
            className="w-full text-left p-4 rounded border border-hermes-border hover:border-hermes-green group transition-colors bg-hermes-surface"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-hermes-green font-bold text-sm uppercase tracking-wider">► Hermes</span>
            </div>
            <div className="text-hermes-muted text-xs leading-relaxed">
              Connect to a self-hosted Hermes node on your local network. Requires the host IP and an optional bearer token.
            </div>
          </button>

          <button
            onClick={() => selectProvider('lmstudio')}
            className="w-full text-left p-4 rounded border border-hermes-border hover:border-hermes-green group transition-colors bg-hermes-surface"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-hermes-green font-bold text-sm uppercase tracking-wider">► LM Studio</span>
            </div>
            <div className="text-hermes-muted text-xs leading-relaxed">
              Connect to LM Studio running locally or on your network. Enable the local server in the Developer tab first.
            </div>
          </button>
        </div>
      </div>
    )
  }

  /* ── CONNECT ────────────────────────────────────────────────── */
  if (step === 'connect') {
    return (
      <div className="h-full overflow-y-auto p-5 font-mono">
        <button
          onClick={() => setStep('provider')}
          className="text-hermes-green text-xs uppercase tracking-wider mb-4 inline-flex items-center gap-1 hover:opacity-80"
        >
          ← Back
        </button>

        <div className="text-hermes-muted text-[10px] uppercase tracking-widest mb-1">Step 2 of 2</div>
        <h2 className="text-hermes-green font-bold text-lg tracking-wider mb-1">
          {provider === 'lmstudio' ? 'LM STUDIO' : 'HERMES NODE'}
        </h2>
        <p className="text-hermes-muted text-xs mb-5 leading-relaxed">
          {provider === 'lmstudio'
            ? 'Make sure the LM Studio local server is running. Go to the Developer tab and press Start Server.'
            : 'Enter the IP address of the machine running your Hermes node. Both devices must be on the same network.'}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-hermes-muted uppercase tracking-wider mb-1.5">
              {provider === 'lmstudio' ? 'Host' : 'Host IP'}{' '}
              {provider !== 'lmstudio' && <span className="text-hermes-border normal-case">required</span>}
            </label>
            <input
              type="text"
              value={host}
              onChange={e => setHost(e.target.value)}
              placeholder={PROVIDER_DEFAULTS[provider].host || '192.168.1.100'}
              className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] text-hermes-muted uppercase tracking-wider mb-1.5">Port</label>
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
              <label className="block text-[10px] text-hermes-muted uppercase tracking-wider mb-1.5">
                API Key <span className="text-hermes-border normal-case">optional</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="lm-studio"
                className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
              />
              <p className="text-hermes-muted/60 text-[10px] mt-1.5 leading-relaxed">
                Set in LM Studio → Developer → API Key. Leave blank to use the default.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-hermes-muted uppercase tracking-wider mb-1.5">
                Bearer Token <span className="text-hermes-border normal-case">optional</span>
              </label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="your-token"
                className="w-full bg-hermes-surface border border-hermes-border rounded px-3 py-2.5 text-white text-sm font-mono focus:border-hermes-green focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={goToTest}
            disabled={!canConnect}
            className="w-full py-2.5 rounded bg-hermes-green text-black font-bold text-sm uppercase tracking-widest hover:bg-green-400 transition-colors disabled:opacity-40 mt-2"
          >
            Test Connection →
          </button>
        </div>
      </div>
    )
  }

  /* ── TEST ───────────────────────────────────────────────────── */
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-xs">
        <h2 className="text-hermes-green font-bold text-lg tracking-wider mb-6 text-center">
          {testing ? 'CONNECTING...' : testResult === true ? 'NODE ONLINE' : 'TEST FAILED'}
        </h2>

        <div className="space-y-1.5 text-xs mb-6">
          <div className="flex gap-2">
            <span className="text-hermes-green shrink-0">[  ]</span>
            <span className="text-hermes-green/70">Pinging {resolvedHost}:{port}...</span>
          </div>

          {!testing && testResult !== null && (
            <div className="flex gap-2">
              <span className={testResult ? 'text-hermes-green shrink-0' : 'text-red-400 shrink-0'}>
                {testResult ? '[✓]' : '[✗]'}
              </span>
              <span className={testResult ? 'text-hermes-green' : 'text-red-400'}>
                {testResult ? 'Connection established.' : 'Host unreachable.'}
              </span>
            </div>
          )}

          {testing && (
            <div className="flex gap-2">
              <span className="text-hermes-muted shrink-0">[  ]</span>
              <span className="text-hermes-muted/70">
                Awaiting response
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-hermes-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-hermes-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-hermes-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            </div>
          )}

          {!testing && testResult === false && (
            <p className="text-hermes-muted/70 mt-3 text-[10px] leading-relaxed">
              Verify the node is running and both devices are on the same network.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setStep('connect'); setTestResult(null) }}
            className="flex-1 py-2.5 rounded border border-hermes-border text-hermes-muted text-xs uppercase tracking-wider hover:border-hermes-green hover:text-hermes-green transition-colors"
          >
            ← Back
          </button>

          {testResult === false && (
            <button
              onClick={runTest}
              disabled={testing}
              className="flex-1 py-2.5 rounded border border-hermes-border text-hermes-muted text-xs uppercase tracking-wider hover:border-hermes-green hover:text-hermes-green transition-colors disabled:opacity-40"
            >
              Retry
            </button>
          )}

          <button
            onClick={finish}
            disabled={testing}
            className={`flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              testResult === true
                ? 'bg-hermes-green text-black hover:bg-green-400'
                : 'bg-hermes-surface border border-hermes-border text-hermes-muted hover:border-hermes-green hover:text-hermes-green'
            }`}
          >
            {testResult === true ? 'Launch →' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  )
}
