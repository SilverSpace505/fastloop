import {
  bestTime,
  id,
  leaderboardPages,
  loadLeaderboard,
  refreshLeaderboard,
  resetPlayer,
  scene,
  username,
} from './global';
import { sendMsg } from './network';

const playButton = document.getElementById('play') as HTMLButtonElement;
const leftButton = document.getElementById('left') as HTMLButtonElement;
const rightButton = document.getElementById('right') as HTMLButtonElement;
const usernameI = document.getElementById('username') as HTMLInputElement;
const pageDisplay = document.getElementById('page');

export function renderMenu() {}

let leaderboardPage = 0;

playButton.onclick = () => {
  scene.v = 'game';
  resetPlayer.v();
  playButton.blur();
};

const leaderboard = document.getElementById('times');

loadLeaderboard.v = (
  page: number,
  times: { username: string; time: number }[],
) => {
  if (!leaderboard) return;
  leaderboard.innerHTML = '';
  for (let i = 0; i < times.length; i++) {
    leaderboard.innerHTML += `<div id='ltimediv'><p id='rank'>#${i + 1 + page * 10}</p> <p id='lusername'>${times[i].username}</p> <p id='ltime'>${Math.round(times[i].time * 100) / 100}</p></div>`;
    // leaderboard.textContent += times[0].username;
  }
};

refreshLeaderboard.v = () => {
  if (scene.v == 'menu') sendMsg({ leaderboard: leaderboardPage });
};

setInterval(refreshLeaderboard.v, 5000);

usernameI.oninput = () => {
  usernameI.value = usernameI.value.replace(/[^a-zA-Z0-9-]/g, '');
  if (usernameI.value.length < 3) return;
  username.v = usernameI.value;
  if (bestTime.v) sendMsg({ setUsername: { id: id.v, username: username.v } });
  localStorage.setItem('username', username.v);
};

rightButton.onclick = () => {
  if (leaderboardPage < leaderboardPages.v - 1) {
    leaderboardPage++;
    if (pageDisplay) pageDisplay.textContent = `Page ${leaderboardPage + 1}`;
    refreshLeaderboard.v();
  }
};

leftButton.onclick = () => {
  if (leaderboardPage > 0) {
    leaderboardPage--;
    if (pageDisplay) pageDisplay.textContent = `Page ${leaderboardPage + 1}`;
    refreshLeaderboard.v();
  }
};
