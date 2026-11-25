import { SERIAL_BAUD_RATE } from "./constants";
import { ObdError, type Transport } from "./types";

// Minimal Web Serial typings (not part of TypeScript's DOM lib).
interface SerialPortLike {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}

interface SerialLike {
  requestPort(): Promise<SerialPortLike>;
}

function getSerial(): SerialLike | undefined {
  return (navigator as unknown as { serial?: SerialLike }).serial;
}

/** Opens the browser's port picker, then the chosen port. Needs a user gesture. */
export async function connectSerial(): Promise<Transport> {
  const serial = getSerial();
  if (!serial) {
    throw new ObdError("unsupported", "This browser does not support Web Serial. Use Chrome or Edge.");
  }

  const port = await serial.requestPort();
  try {
    await port.open({ baudRate: SERIAL_BAUD_RATE });
  } catch (error) {
    throw new ObdError("serial-open-failed", "Could not open the serial port. It may be in use by another program.", error);
  }

  if (!port.readable || !port.writable) {
    await port.close().catch(() => undefined);
    throw new ObdError("serial-unavailable", "The serial port is not readable and writable.");
  }

  const reader = port.readable.getReader();
  const writer = port.writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let dataCallback: ((chunk: string) => void) | null = null;
  let closeCallback: (() => void) | null = null;
  let closing = false;

  const readLoop = async (): Promise<void> => {
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value && dataCallback) dataCallback(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error("[obd] serial read failed", error);
    } finally {
      if (!closing && closeCallback) closeCallback();
    }
  };
  void readLoop();

  return {
    kind: "serial",
    write: async (data) => {
      await writer.write(encoder.encode(data));
    },
    onData: (callback) => {
      dataCallback = callback;
    },
    onClose: (callback) => {
      closeCallback = callback;
    },
    close: async () => {
      closing = true;
      try {
        await reader.cancel();
      } catch {
        /* already closed */
      }
      try {
        reader.releaseLock();
      } catch {
        /* lock already released */
      }
      try {
        await writer.close();
      } catch {
        /* already closed */
      }
      try {
        writer.releaseLock();
      } catch {
        /* lock already released */
      }
      try {
        await port.close();
      } catch {
        /* already closed */
      }
    },
  };
}
