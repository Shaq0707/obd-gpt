"use client";

import { Bluetooth, Plug, Usb } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ConnectionMethod } from "@/types/obd";

const METHODS: { id: ConnectionMethod; label: string; Icon: typeof Usb }[] = [
  { id: "bluetooth", label: "Bluetooth", Icon: Bluetooth },
  { id: "serial", label: "USB / Serial", Icon: Usb },
];

export default function ConnectionCard() {
  const [method, setMethod] = useState<ConnectionMethod>("bluetooth");
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <section className="rounded-xl border border-white/10 bg-[#14181c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <div>
            <h2 className="font-medium">Device Connection</h2>
            <p className="text-sm text-zinc-400">Status: Disconnected</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            setNotice(
              "Device connection will be added in a future phase. Nothing is connected.",
            )
          }
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
        >
          <Plug size={16} />
          Connect Device
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {METHODS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
              method === id
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-zinc-400 hover:text-zinc-200",
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        Browser compatibility: Web Bluetooth and Web Serial work in Chromium
        browsers (Chrome, Edge) over HTTPS. Not supported in Firefox or Safari.
      </p>

      {notice && (
        <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
          {notice}
        </p>
      )}
    </section>
  );
}
