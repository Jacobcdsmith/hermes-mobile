# Hermes Mobile

A lightweight PWA for connecting to your local [Hermes](https://github.com/Jacobcdsmith/jclaw-framework) LLM agent from your phone over the local network.

## Features

- **PWA installable** — add to home screen, runs fullscreen
- **Streaming chat** — real-time token streaming via SSE
- **Model selector** — auto-discovers models from `/v1/models`
- **Health monitoring** — live connection status indicator
- **Local history** — conversations saved in localStorage (max 50)
- **Dark terminal aesthetic** — matches Hermes branding
- **Zero backend** — pure client-side, talks directly to your Hermes instance

## Quick Start

```bash
npm install
npm run dev
```

Open on your phone (same network) and enter your machine's local IP in Settings.

## Hermes Endpoints

The app expects these endpoints on your Hermes instance:

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Connection check |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Chat (streaming + non-streaming) |

**Auth:** Bearer token (default: `jacob-local-key`)

## Deploy

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · vite-plugin-pwa
