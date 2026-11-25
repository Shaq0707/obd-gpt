# OBD-GPT

Browser-based OBD-II diagnostics dashboard. **Phase 1** is a static frontend foundation: no device communication, no simulated vehicle data.

## Stack

Next.js (App Router), TypeScript (strict), Tailwind CSS, Lucide icons.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run typecheck
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New > Project**, import `obd-gpt`.
3. Keep the default Next.js settings and deploy. No environment variables are needed.

## Phase 1 limitations

- Connect / Read Codes / Clear Codes buttons only show an information message.
- Live data shows `--` because no vehicle is connected.
- Not implemented: Web Bluetooth, Web Serial, ELM327, PID parsing, DTC reading/clearing, AI assistant, backend, auth.

## Planned

Web Bluetooth / Web Serial connection to ELM327 adapters, live PID data, DTC read/clear, then an AI diagnostic assistant.
