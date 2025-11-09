import {
  leaderboardPages,
  loadLeaderboard,
  refreshLeaderboard,
} from './global';

import socket from '../../axion/socket';

export { socket };

export function getViews() {
  sendMsg({ getViews: true });
}

export function sendMsg(msg: object) {
  socket.sendMsg(msg);
}

socket.connectToServer('fastloop', true);

socket.onConnect = () => {
  refreshLeaderboard.v();
};

socket.onMsg = (msg) => {
  if ('leaderboard' in msg) {
    leaderboardPages.v = msg.leaderboard.pages;
    loadLeaderboard.v(msg.leaderboard.page, msg.leaderboard.times);
  }
};
