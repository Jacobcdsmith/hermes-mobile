<div align="center">

```
 ██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗
 ██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝
 ███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗
 ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║
 ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝
                    M O B I L E
```

**`>_` Your local LLM — in your pocket.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-jacobcdsmith.github.io%2Fhermes--mobile-22c55e?style=for-the-badge&logoColor=white)](https://jacobcdsmith.github.io/hermes-mobile/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-22c55e?style=for-the-badge&logo=pwa&logoColor=white)](https://jacobcdsmith.github.io/hermes-mobile/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

*A zero-backend PWA for streaming conversations with your local [Hermes](https://github.com/Jacobcdsmith/jclaw-framework) LLM agent — over your home network, from any device.*

</div>

---

## `>_` What is Hermes Mobile?

Hermes Mobile is a **Progressive Web App** that turns your phone into a terminal-style chat interface for your self-hosted LLM. Point it at your local machine's IP, install it to your home screen, and chat — no cloud, no middleman, no cost.

> Built to feel like a hacker terminal. Runs like a native app.

---

## ✦ Features

| | Feature | Description |
|---|---|---|
| 📲 | **PWA Installable** | Add to home screen — runs fullscreen with no browser chrome |
| ⚡ | **Real-Time Streaming** | Token-by-token streaming via Server-Sent Events (SSE) |
| 🤖 | **Model Selector** | Auto-discovers all models from your `/v1/models` endpoint |
| 🟢 | **Health Monitor** | Live pulsing indicator — always know if your agent is reachable |
| 📋 | **Local History** | Up to 50 conversations saved to `localStorage` — private, on-device |
| 🖤 | **Terminal Aesthetic** | Dark theme, green accents, monospace font — pure Hermes vibes |
| 🔒 | **Zero Backend** | 100% client-side — talks directly to your Hermes instance |

---

## 🚀 Try it Live

<div align="center">

### **[→ jacobcdsmith.github.io/hermes-mobile](https://jacobcdsmith.github.io/hermes-mobile/)**

*Open on your phone · Enter your machine's local IP in Settings · Start chatting*

</div>

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open `http://localhost:5173` — or better yet, your machine's **local IP** on your phone (same Wi-Fi network). Go to **Settings** and enter your Hermes host address.

---

## 🔌 Hermes API Contract

Hermes Mobile expects the following endpoints on your [Hermes](https://github.com/Jacobcdsmith/jclaw-framework) instance:

```
┌─────────────────────────┬────────┬──────────────────────────────────────┐
│ Endpoint                │ Method │ Purpose                              │
├─────────────────────────┼────────┼──────────────────────────────────────┤
│ /health                 │ GET    │ Connection heartbeat check            │
│ /v1/models              │ GET    │ Enumerate available models            │
│ /v1/chat/completions    │ POST   │ Chat — streaming & non-streaming      │
└─────────────────────────┴────────┴──────────────────────────────────────┘
```

> **Auth:** `Authorization: Bearer jacob-local-key` *(configurable in Settings)*

---

## 🏗️ Stack

<div align="center">

| Layer | Technology |
|---|---|
| ⚛️ UI Framework | React 18 |
| 🔷 Language | TypeScript 5 |
| 🎨 Styling | Tailwind CSS |
| ⚡ Bundler | Vite 5 |
| 📲 PWA | vite-plugin-pwa |

</div>

---

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

The `dist/` folder is a fully static site — deploy anywhere:

```
┌──────────────────────────────────────────────────────┐
│  ✓  GitHub Pages  ←  this repo auto-deploys here     │
│  ✓  Vercel                                            │
│  ✓  Netlify                                           │
│  ✓  Any static host / CDN                             │
└──────────────────────────────────────────────────────┘
```

> Pushes to `main` automatically deploy to **[GitHub Pages](https://jacobcdsmith.github.io/hermes-mobile/)** via the included workflow.

---

<div align="center">

*Built with 🖤 for the self-hosted AI stack.*

[![Hermes Framework](https://img.shields.io/badge/Powered%20by-Hermes%20Framework-22c55e?style=flat-square)](https://github.com/Jacobcdsmith/jclaw-framework)

</div>
