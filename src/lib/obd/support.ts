export interface BrowserSupport {
  /** Web Serial / Web Bluetooth only work on HTTPS or localhost. */
  secureContext: boolean;
  serial: boolean;
  bluetooth: boolean;
}

/** Client-side only. Returns all-false during server rendering. */
export function getBrowserSupport(): BrowserSupport {
  if (typeof window === "undefined") {
    return { secureContext: false, serial: false, bluetooth: false };
  }
  return {
    secureContext: window.isSecureContext,
    serial: "serial" in navigator,
    bluetooth: "bluetooth" in navigator,
  };
}
