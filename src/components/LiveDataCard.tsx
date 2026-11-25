import { cn, formatValue } from "@/lib/utils";
import type { LiveDataItem } from "@/types/obd";

export default function LiveDataCard({ item }: { item: LiveDataItem }) {
  const empty = item.value === null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#14181c] p-5">
      <p className="text-sm text-zinc-400">{item.label}</p>
      <p
        className={cn(
          "mt-3 text-4xl font-semibold tabular-nums",
          empty ? "text-zinc-600" : "text-emerald-400",
        )}
      >
        {formatValue(item.value)}
        <span className="ml-2 text-base font-normal text-zinc-500">
          {item.unit}
        </span>
      </p>
    </div>
  );
}
