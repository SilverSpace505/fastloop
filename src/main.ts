import * as THREE from 'three/webgpu';
import { camera, renderGame, renderer } from './game';
import { scene } from './global';
import { renderMenu } from './menu';
import utils from './utils';

import { socket } from './network';

const menuElement = document.getElementById('menu');
const gameElement = document.getElementById('game');

camera.position.set(-2, 2, 3);
camera.rotation.set(0, -Math.PI / 8, 0);

let menuOpacity = 1;

renderer.setAnimationLoop(() => {
  renderGame(scene.v == 'game');

  socket.maintainConnection();

  if (scene.v == 'menu') {
    const yangle = -Math.PI / 8;
    const xangle = 0;

    const target = new THREE.Quaternion();
    target.copy(
      new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(0, 1, 0), yangle)
        .multiply(target),
    );

    target.copy(
      new THREE.Quaternion()
        .setFromAxisAngle(
          new THREE.Vector3(Math.cos(-yangle), 0, Math.sin(-yangle)),
          xangle,
        )
        .multiply(target),
    );

    const multiply = 1 - (1 - 0.5) ** (utils.delta * 10);

    camera.position.lerp(new THREE.Vector3(-2, 2, 3), multiply);
    camera.quaternion.slerp(target, multiply);

    renderMenu();
  }

  menuOpacity = utils.lerp5(
    menuOpacity,
    scene.v == 'menu' ? 1 : 0,
    utils.delta * 15,
  );

  if (menuElement) {
    menuElement.style.opacity = menuOpacity + '';
    menuElement.style.display = menuOpacity < 0.01 ? 'none' : 'block';
  }

  if (gameElement) {
    gameElement.style.opacity = 1 - menuOpacity + '';
    gameElement.style.display = 1 - menuOpacity < 0.01 ? 'none' : 'block';
  }
});
