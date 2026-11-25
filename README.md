# OBD-GPT

Browser-based OBD-II diagnostics dashboard.

- **Phase 1:** static dashboard (no simulated vehicle data).
- **Phase 2:** real connection to an ELM327 adapter over Web Serial or Web Bluetooth, adapter initialization, real connection status.

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

## Phase 2: connecting an adapter

Code lives in `src/lib/obd/`:

| File | Purpose |
| --- | --- |
| `serial.ts` | Web Serial transport (38400 baud) |
| `bluetooth.ts` | Web Bluetooth (BLE / GATT) transport |
| `elm327.ts` | Command sending, prompt (`>`) detection, init sequence |
| `connectionManager.ts` | Connection state, connect / disconnect, error handling |
| `constants.ts` | Baud rate, timeouts, init commands, BLE UUID profiles |

**Init sequence** (in order): `ATZ`, `ATE0`, `ATL0`, `ATS0`, `ATH0`, `ATSP0`. The status shows "Connected" only after every step got the expected answer.

**Requirements**

- A Chromium browser (Chrome or Edge). Firefox and Safari do not support these APIs.
- HTTPS (Vercel provides it) or `localhost`.
- The connect button must be clicked by the user; the browser then shows its own device picker.

**Limitations**

- Many ELM327 adapters use Bluetooth Classic (SPP). Web Bluetooth cannot use them; use a USB adapter, or a Bluetooth adapter that the OS exposes as a serial port, with the USB / Serial option.
- BLE adapters differ in their GATT UUIDs. `constants.ts` lists three commonly reported layouts; add your adapter's UUIDs there if needed.
- **No physical adapter has been tested yet.** The init logic was only exercised against a simulated adapter in a script; real Serial and Bluetooth communication still needs to be verified on hardware.

Not included yet (Phase 3+): live PID data, reading/clearing trouble codes, AI assistant.
