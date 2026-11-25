/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a reading for display; "--" when there is no value. */
export function formatValue(value: number | null): string {
  return value === null ? "--" : String(value);
}
