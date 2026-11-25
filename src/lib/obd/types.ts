import type { ConnectionMethod } from "@/types/obd";

/** Byte pipe to an adapter. Serial and Bluetooth each implement this. */
export interface Transport {
  readonly kind: ConnectionMethod;
  write(data: string): Promise<void>;
  onData(callback: (chunk: string) => void): void;
  /** Called when the link closes without close() having been requested. */
  onClose(callback: () => void): void;
  close(): Promise<void>;
}

/** Error with a stable code and a message that is safe to show to users. */
export class ObdError extends Error {
  readonly code: string;
  readonly detail?: unknown;

  constructor(code: string, message: string, detail?: unknown) {
    super(message);
    this.name = "ObdError";
    this.code = code;
    this.detail = detail;
  }
}
