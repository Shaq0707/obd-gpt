"use client";

import { AlertTriangle, ScanLine, Trash2 } from "lucide-react";
import { useState } from "react";

const FUTURE_NOTICE =
  "This feature will be implemented in a future phase. No codes were read or cleared.";

export default function DiagnosticsCard() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <section className="rounded-xl border border-white/10 bg-[#14181c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">Diagnostic Trouble Codes</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNotice(FUTURE_NOTICE)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/5"
          >
            <ScanLine size={16} />
            Read Codes
          </button>
          <button
            type="button"
            onClick={() => setNotice(FUTURE_NOTICE)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
          >
            <Trash2 size={16} />
            Clear Codes
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed border-white/10 px-4 py-10 text-center">
        <AlertTriangle className="text-zinc-600" size={28} />
        <p className="mt-3 text-sm text-zinc-400">
          No vehicle connected. Trouble codes will appear here.
        </p>
      </div>

      {notice && (
        <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
          {notice}
        </p>
      )}
    </section>
  );
}
