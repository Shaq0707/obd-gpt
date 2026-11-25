import { Gauge } from "lucide-react";

const NAV_ITEMS = ["Dashboard", "Live Data", "Diagnostics"];

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0f1215]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Gauge size={20} />
          </div>
          <span className="text-lg font-semibold tracking-wide">
            OBD<span className="text-emerald-400">-GPT</span>
          </span>
        </div>
        <nav className="hidden gap-6 text-sm text-zinc-400 sm:flex">
          {NAV_ITEMS.map((item, i) => (
            <span
              key={item}
              className={i === 0 ? "text-zinc-100" : "cursor-default"}
            >
              {item}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
