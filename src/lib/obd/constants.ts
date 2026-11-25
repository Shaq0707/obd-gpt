/** Default baud rate for most USB / serial ELM327 adapters. */
export const SERIAL_BAUD_RATE = 38400;

export const COMMAND_TIMEOUT_MS = 5000;
/** ATZ restarts the adapter and is much slower than other commands. */
export const RESET_TIMEOUT_MS = 10000;

export interface InitStep {
  command: string;
  /** Substring the (normalized, upper-case) response must contain. */
  expect: string;
}

/** Initialization sequence; run in this order. */
export const INIT_COMMANDS: readonly InitStep[] = [
  { command: "ATZ", expect: "ELM" }, // reset, answers with the ELM version
  { command: "ATE0", expect: "OK" }, // echo off
  { command: "ATL0", expect: "OK" }, // linefeeds off
  { command: "ATS0", expect: "OK" }, // spaces off
  { command: "ATH0", expect: "OK" }, // headers off
  { command: "ATSP0", expect: "OK" }, // automatic protocol
];

export interface BleProfile {
  name: string;
  service: string;
  /** Characteristic the adapter sends data on (notifications). */
  notify: string;
  /** Characteristic we write commands to. Often the same as notify. */
  write: string;
}

/**
 * GATT layouts commonly reported for BLE ELM327 adapters. Not every adapter
 * matches one of these; add the UUIDs of your adapter here if needed.
 * None of these profiles has been verified against real hardware yet.
 */
export const BLE_PROFILES: readonly BleProfile[] = [
  {
    name: "FFE0 / FFE1",
    service: "0000ffe0-0000-1000-8000-00805f9b34fb",
    notify: "0000ffe1-0000-1000-8000-00805f9b34fb",
    write: "0000ffe1-0000-1000-8000-00805f9b34fb",
  },
  {
    name: "FFF0 / FFF1 / FFF2",
    service: "0000fff0-0000-1000-8000-00805f9b34fb",
    notify: "0000fff1-0000-1000-8000-00805f9b34fb",
    write: "0000fff2-0000-1000-8000-00805f9b34fb",
  },
  {
    name: "Vgate iCar style",
    service: "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
    notify: "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
    write: "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
  },
];
