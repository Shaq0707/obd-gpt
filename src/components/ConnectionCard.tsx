"use client";

import { Bluetooth, Plug, Usb } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getBrowserSupport, type BrowserSupport } from "@/lib/obd/support";
import { useObdConnection } from "@/lib/obd/useObdConnection";
import type { ConnectionMethod, ConnectionStatus } from "@/types/obd";

const METHODS: { id: ConnectionMethod; label: string; Icon: typeof Usb }[] = [
  { id: "bluetooth", label: "Bluetooth", Icon: Bluetooth },
  { id: "serial", label: "USB / Serial", Icon: Usb },
];

const STATUS_TEXT: Record<ConnectionStatus, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting... choose your adapter in the browser prompt",
  initializing: "Initializing ELM327...",
  connected: "Connected",
  disconnecting: "Disconnecting...",
  error: "Connection error",
};

const DOT_COLOR: Record<ConnectionStatus, string> = {
  disconnected: "bg-red-500",
  connecting: "bg-orange-400 animate-pulse",
  initializing: "bg-orange-400 animate-pulse",
  connected: "bg-emerald-400",
  disconnecting: "bg-orange-400 animate-pulse",
  error: "bg-red-500",
};

function methodLabel(method: ConnectionMethod | null): string {
  return METHODS.find((m) => m.id === method)?.label ?? "";
}

export default function ConnectionCard() {
  const { state, connect, disconnect } = useObdConnection();
  const [method, setMethod] = useState<ConnectionMethod>("bluetooth");
  const [support, setSupport] = useState<BrowserSupport | null>(null);

  // Browser APIs are only known on the client, so check after mount.
  useEffect(() => {
    setSupport(getBrowserSupport());
  }, []);

  const { status } = state;
  const idle = status === "disconnected" || status === "error";
  const busy =
    status === "connecting" || status === "initializing" || status === "disconnecting";

  let unsupported: string | null = null;
  if (support) {
    if (!support.secureContext) {
      unsupported = "Device access needs a secure page (HTTPS or localhost).";
    } else if (method === "serial" && !support.serial) {
      unsupported = "This browser does not support Web Serial. Use Chrome or Edge.";
    } else if (method === "bluetooth" && !support.bluetooth) {
      unsupported = "This browser does not support Web Bluetooth. Use Chrome or Edge.";
    }
  }

  const statusText =
    status === "connected"
      ? `Connected via ${methodLabel(state.method)}${state.adapterInfo ? ` (${state.adapterInfo})` : ""}`
      : STATUS_TEXT[status];

  return (
    <section className="rounded-xl border border-white/10 bg-[#14181c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("h-3 w-3 rounded-full", DOT_COLOR[status])} />
          <div>
            <h2 className="font-medium">Device Connection</h2>
            <p className="text-sm text-zinc-400">Status: {statusText}</p>
          </div>
        </div>

        {status === "connected" ? (
          <button
            type="button"
            onClick={() => void disconnect()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            disabled={!idle || unsupported !== null}
            onClick={() => void connect(method)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plug size={16} />
            {status === "error" ? "Retry" : "Connect Device"}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {METHODS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            disabled={!idle}
            onClick={() => setMethod(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60",
              (state.method ?? method) === id
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-zinc-400 hover:text-zinc-200",
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {unsupported && idle && (
        <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
          {unsupported}
        </p>
      )}

      {state.error && !busy && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        Web Bluetooth and Web Serial work in Chromium browsers (Chrome, Edge) over
        HTTPS. Many ELM327 adapters use Bluetooth Classic, which Web Bluetooth
        cannot use. If Bluetooth does not find your adapter, try USB / Serial.
      </p>
    </section>
  );
}
