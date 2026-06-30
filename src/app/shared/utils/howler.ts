import type { Howl } from "howler";

export function preload(howl: Howl): void {
  if (howl.state() !== "unloaded") {
    return;
  }

  howl.load();
}
