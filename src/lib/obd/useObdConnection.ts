"use client";

import { useSyncExternalStore } from "react";
import type { ConnectionState } from "@/types/obd";
import { connectionManager } from "./connectionManager";

export function useObdConnection(): {
  state: ConnectionState;
  connect: typeof connectionManager.connect;
  disconnect: typeof connectionManager.disconnect;
} {
  const state = useSyncExternalStore(
    connectionManager.subscribe,
    connectionManager.getState,
    connectionManager.getServerState,
  );
  return {
    state,
    connect: connectionManager.connect,
    disconnect: connectionManager.disconnect,
  };
}
