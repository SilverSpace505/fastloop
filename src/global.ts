export const scene = { v: 'menu' };
export const resetPlayer: { v: () => void } = { v: () => {} };
export const leaderboardPages = { v: 0 };
export const refreshLeaderboard: { v: () => void } = { v: () => {} };
export const loadLeaderboard: {
  v: (page: number, times: { username: string; time: number }[]) => void;
} = { v: () => {} };
export const bestTime: { v: number | null } = { v: null };

const loaded = localStorage.getItem('besttime');
if (loaded) bestTime.v = parseFloat(loaded) ?? null;

const bestTimeDisplay = document.getElementById('besttime');
if (bestTimeDisplay && bestTime.v != null)
  bestTimeDisplay.textContent = `BEST TIME: ${Math.round(bestTime.v * 100) / 100}`;

const bestTimeMenuDisplay = document.getElementById('besttimemenu');
if (bestTimeMenuDisplay && bestTime.v != null)
  bestTimeMenuDisplay.textContent = `BEST TIME: ${Math.round(bestTime.v * 100) / 100}`;

//

export const username = { v: '' };
export const id = { v: '' };

const loadedUsername = localStorage.getItem('username');
if (loadedUsername) username.v = loadedUsername.replace(/[^a-zA-Z0-9-]/g, '');

const loadedId = localStorage.getItem('id');
if (loadedId) id.v = loadedId.replace(/[^a-zA-Z0-9]/g, '');

if (!id.v || id.v.length != 10) {
  const letters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  let newId = '';
  for (let i = 0; i < 10; i++) {
    newId += letters[Math.floor(Math.random() * letters.length)];
  }
  id.v = newId;
}

localStorage.setItem('id', id.v);

if (username.v.length == 0) {
  username.v = `player-${id.v.slice(0, 5)}`;
}

localStorage.setItem('username', username.v);

const usernameI = document.getElementById('username') as HTMLInputElement;
usernameI.value = username.v;
