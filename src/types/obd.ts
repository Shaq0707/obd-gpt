export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export type ConnectionMethod = "bluetooth" | "serial";

export interface LiveDataItem {
  id: string;
  label: string;
  unit: string;
  /** null = no vehicle connected. Phase 1 never shows simulated readings. */
  value: number | null;
}
