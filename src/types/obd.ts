export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "initializing"
  | "connected"
  | "disconnecting"
  | "error";

export type ConnectionMethod = "bluetooth" | "serial";

export interface ConnectionState {
  status: ConnectionStatus;
  method: ConnectionMethod | null;
  /** User-facing message; null when there is nothing to report. */
  error: string | null;
  /** Adapter identification string (e.g. "ELM327 V1.5"), set after init. */
  adapterInfo: string | null;
}

export interface LiveDataItem {
  id: string;
  label: string;
  unit: string;
  /** null = no vehicle connected. Phase 1 never shows simulated readings. */
  value: number | null;
}
