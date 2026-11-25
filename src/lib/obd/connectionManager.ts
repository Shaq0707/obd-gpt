import type { ConnectionMethod, ConnectionState } from "@/types/obd";
import { connectBluetooth } from "./bluetooth";
import { Elm327 } from "./elm327";
import { connectSerial } from "./serial";
import { ObdError, type Transport } from "./types";

type Listener = () => void;

const INITIAL_STATE: ConnectionState = {
  status: "disconnected",
  method: null,
  error: null,
  adapterInfo: null,
};

/** Turns any thrown value into a message that is fine to show in the UI. */
function toUserMessage(error: unknown): string {
  if (error instanceof ObdError) return error.message;
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Permission to use the device was denied.";
      case "NetworkError":
        return "Could not connect to the device. Make sure it is powered on and in range.";
      case "InvalidStateError":
        return "The device is busy or already in use.";
      default:
        break;
    }
  }
  return "Something went wrong while talking to the device.";
}

/**
 * Single source of truth for the adapter connection. The UI subscribes to it
 * and only ever shows what actually happened.
 */
class ConnectionManager {
  private state: ConnectionState = INITIAL_STATE;
  private listeners = new Set<Listener>();
  private transport: Transport | null = null;
  private elm: Elm327 | null = null;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = (): ConnectionState => this.state;

  getServerState = (): ConnectionState => INITIAL_STATE;

  private setState(patch: Partial<ConnectionState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  /** Must be called from a user action (click) so the browser allows the picker. */
  connect = async (method: ConnectionMethod): Promise<void> => {
    if (this.state.status !== "disconnected" && this.state.status !== "error") return;

    this.setState({ status: "connecting", method, error: null, adapterInfo: null });

    let transport: Transport | null = null;
    try {
      transport = method === "serial" ? await connectSerial() : await connectBluetooth();
      this.transport = transport;
      const elm = new Elm327(transport);
      this.elm = elm;
      const opened = transport;
      transport.onClose(() => void this.handleUnexpectedClose(opened));

      this.setState({ status: "initializing" });
      const adapterInfo = await elm.initialize();

      if (this.transport !== opened) return; // closed while initializing
      this.setState({ status: "connected", adapterInfo });
    } catch (error) {
      if (transport && this.transport !== transport) return; // already handled
      console.error("[obd] connection failed", error);
      await this.cleanup();

      if (error instanceof DOMException && error.name === "NotFoundError") {
        // The user closed the browser's device picker without choosing.
        this.setState({ status: "disconnected", error: "No device was selected." });
        return;
      }
      this.setState({ status: "error", error: toUserMessage(error) });
    }
  };

  disconnect = async (): Promise<void> => {
    if (!this.transport) return;
    this.setState({ status: "disconnecting" });
    await this.cleanup();
    this.setState({ status: "disconnected", method: null, error: null, adapterInfo: null });
  };

  private async handleUnexpectedClose(closed: Transport): Promise<void> {
    if (this.transport !== closed) return;
    await this.cleanup();
    this.setState({
      status: "error",
      error: "The device disconnected unexpectedly.",
      adapterInfo: null,
    });
  }

  private async cleanup(): Promise<void> {
    const transport = this.transport;
    const elm = this.elm;
    this.transport = null;
    this.elm = null;
    elm?.dispose();
    if (transport) {
      try {
        await transport.close();
      } catch (error) {
        console.error("[obd] error while closing", error);
      }
    }
  }
}

export const connectionManager = new ConnectionManager();
