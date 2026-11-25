import { COMMAND_TIMEOUT_MS, INIT_COMMANDS, RESET_TIMEOUT_MS } from "./constants";
import { ObdError, type Transport } from "./types";

/** Strip the prompt and line breaks, collapse spaces, upper-case. */
export function normalizeResponse(raw: string): string {
  return raw
    .replace(/>/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

interface PendingCommand {
  resolve: (response: string) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Sends one command at a time and resolves when the adapter answers with its
 * ">" prompt. Chunks may arrive split (BLE), so data is buffered until then.
 */
export class Elm327 {
  private readonly transport: Transport;
  private buffer = "";
  private pending: PendingCommand | null = null;
  private closed = false;

  constructor(transport: Transport) {
    this.transport = transport;
    transport.onData((chunk) => this.handleData(chunk));
  }

  private handleData(chunk: string): void {
    this.buffer += chunk;
    const promptIndex = this.buffer.indexOf(">");
    if (promptIndex < 0) return;

    const raw = this.buffer.slice(0, promptIndex);
    this.buffer = this.buffer.slice(promptIndex + 1);

    const pending = this.pending;
    if (!pending) return; // stale prompt with nobody waiting: drop it
    this.pending = null;
    clearTimeout(pending.timer);
    pending.resolve(normalizeResponse(raw));
  }

  async send(command: string, timeoutMs: number = COMMAND_TIMEOUT_MS): Promise<string> {
    if (this.closed) {
      throw new ObdError("closed", "The adapter connection is closed.");
    }
    if (this.pending) {
      throw new ObdError("busy", "Another adapter command is still running.");
    }

    this.buffer = "";
    const response = new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null;
        reject(new ObdError("timeout", `The adapter did not answer ${command} in time.`));
      }, timeoutMs);
      this.pending = { resolve, reject, timer };
    });

    try {
      await this.transport.write(`${command}\r`);
    } catch (error) {
      this.clearPending();
      throw new ObdError("write-failed", "Could not send data to the adapter.", error);
    }
    return response;
  }

  private clearPending(): void {
    const pending = this.pending;
    if (pending) {
      clearTimeout(pending.timer);
      this.pending = null;
    }
  }

  /**
   * Runs the init sequence. Resolves with the adapter identification string
   * only if every step got the expected answer.
   */
  async initialize(): Promise<string> {
    let adapterInfo = "ELM327";
    for (const step of INIT_COMMANDS) {
      const timeout = step.command === "ATZ" ? RESET_TIMEOUT_MS : COMMAND_TIMEOUT_MS;
      const response = await this.send(step.command, timeout);

      if (response.includes("?") || !response.includes(step.expect)) {
        throw new ObdError(
          "invalid-response",
          `Unexpected adapter answer to ${step.command}: "${response.slice(0, 60)}". This may not be an ELM327-compatible adapter.`,
        );
      }
      if (step.command === "ATZ") {
        const match = response.match(/ELM\d+[^ ]*(?: V?[\d.]+)?/);
        adapterInfo = match ? match[0] : response;
      }
    }
    return adapterInfo;
  }

  /** Rejects any waiting command and refuses new ones. */
  dispose(): void {
    this.closed = true;
    if (this.pending) {
      const pending = this.pending;
      this.pending = null;
      clearTimeout(pending.timer);
      pending.reject(new ObdError("closed", "The adapter connection was closed."));
    }
  }
}
