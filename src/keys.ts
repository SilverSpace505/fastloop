export const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (event: KeyboardEvent) => {
  keys[event.code] = true;
});

window.addEventListener('keyup', (event: KeyboardEvent) => {
  delete keys[event.code];
});
