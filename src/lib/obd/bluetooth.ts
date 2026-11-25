import { BLE_PROFILES } from "./constants";
import { ObdError, type Transport } from "./types";

// Minimal Web Bluetooth typings (not part of TypeScript's DOM lib).
interface BleCharacteristic {
  value?: DataView | null;
  properties: { write: boolean; writeWithoutResponse: boolean };
  startNotifications(): Promise<unknown>;
  stopNotifications(): Promise<unknown>;
  writeValue(value: BufferSource): Promise<void>;
  writeValueWithResponse?(value: BufferSource): Promise<void>;
  writeValueWithoutResponse?(value: BufferSource): Promise<void>;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

interface BleService {
  getCharacteristic(uuid: string): Promise<BleCharacteristic>;
}

interface BleServer {
  getPrimaryService(uuid: string): Promise<BleService>;
  disconnect(): void;
}

interface BleDevice {
  gatt?: { connect(): Promise<BleServer> };
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

interface BluetoothLike {
  requestDevice(options: {
    acceptAllDevices: boolean;
    optionalServices: string[];
  }): Promise<BleDevice>;
}

function getBluetooth(): BluetoothLike | undefined {
  return (navigator as unknown as { bluetooth?: BluetoothLike }).bluetooth;
}

/** Typical BLE write size limit when the MTU has not been negotiated. */
const BLE_CHUNK_SIZE = 20;

/** Opens the browser's device picker and connects over GATT. Needs a user gesture. */
export async function connectBluetooth(): Promise<Transport> {
  const bluetooth = getBluetooth();
  if (!bluetooth) {
    throw new ObdError("unsupported", "This browser does not support Web Bluetooth. Use Chrome or Edge.");
  }

  const device = await bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: BLE_PROFILES.map((profile) => profile.service),
  });
  if (!device.gatt) {
    throw new ObdError("gatt-unavailable", "This device does not offer a Bluetooth LE (GATT) connection.");
  }

  const server = await device.gatt.connect();

  let writeChar: BleCharacteristic | null = null;
  let notifyChar: BleCharacteristic | null = null;
  for (const profile of BLE_PROFILES) {
    try {
      const service = await server.getPrimaryService(profile.service);
      writeChar = await service.getCharacteristic(profile.write);
      notifyChar =
        profile.notify === profile.write ? writeChar : await service.getCharacteristic(profile.notify);
      break;
    } catch {
      writeChar = null;
      notifyChar = null; // this profile is not on the device, try the next
    }
  }
  if (!writeChar || !notifyChar) {
    server.disconnect();
    throw new ObdError(
      "gatt-service-unavailable",
      "No known ELM327 Bluetooth LE service was found on this device. Many ELM327 adapters use Bluetooth Classic, which Web Bluetooth cannot use. Try a USB/Serial connection.",
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let dataCallback: ((chunk: string) => void) | null = null;
  let closeCallback: (() => void) | null = null;
  let closing = false;

  const onValue = (event: Event): void => {
    const value = (event.target as unknown as BleCharacteristic).value;
    if (value && dataCallback) dataCallback(decoder.decode(value, { stream: true }));
  };
  const onDisconnected = (): void => {
    if (!closing && closeCallback) closeCallback();
  };

  try {
    notifyChar.addEventListener("characteristicvaluechanged", onValue);
    await notifyChar.startNotifications();
  } catch (error) {
    notifyChar.removeEventListener("characteristicvaluechanged", onValue);
    server.disconnect();
    throw new ObdError("gatt-notify-failed", "Could not subscribe to the adapter's responses.", error);
  }
  device.addEventListener("gattserverdisconnected", onDisconnected);

  const target = writeChar;
  const source = notifyChar;

  return {
    kind: "bluetooth",
    write: async (data) => {
      const bytes = encoder.encode(data);
      for (let i = 0; i < bytes.length; i += BLE_CHUNK_SIZE) {
        const chunk = bytes.slice(i, i + BLE_CHUNK_SIZE);
        if (target.properties.writeWithoutResponse && target.writeValueWithoutResponse) {
          await target.writeValueWithoutResponse(chunk);
        } else if (target.writeValueWithResponse) {
          await target.writeValueWithResponse(chunk);
        } else {
          await target.writeValue(chunk);
        }
      }
    },
    onData: (callback) => {
      dataCallback = callback;
    },
    onClose: (callback) => {
      closeCallback = callback;
    },
    close: async () => {
      closing = true;
      device.removeEventListener("gattserverdisconnected", onDisconnected);
      source.removeEventListener("characteristicvaluechanged", onValue);
      try {
        await source.stopNotifications();
      } catch {
        /* link may already be down */
      }
      server.disconnect();
    },
  };
}
