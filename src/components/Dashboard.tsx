import ConnectionCard from "@/components/ConnectionCard";
import DiagnosticsCard from "@/components/DiagnosticsCard";
import LiveDataCard from "@/components/LiveDataCard";
import type { LiveDataItem } from "@/types/obd";

// Phase 1: no vehicle connected, so every value is null (shown as "--").
const LIVE_DATA: LiveDataItem[] = [
  { id: "rpm", label: "Engine RPM", unit: "rpm", value: null },
  { id: "speed", label: "Vehicle Speed", unit: "km/h", value: null },
  { id: "coolant", label: "Coolant Temperature", unit: "°C", value: null },
  { id: "throttle", label: "Throttle Position", unit: "%", value: null },
  { id: "load", label: "Engine Load", unit: "%", value: null },
  { id: "iat", label: "Intake Air Temperature", unit: "°C", value: null },
];

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Vehicle Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Phase 1 preview. Device communication is not implemented yet.
        </p>
      </div>

      <ConnectionCard />

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Live Data
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_DATA.map((item) => (
            <LiveDataCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <DiagnosticsCard />
    </main>
  );
}
