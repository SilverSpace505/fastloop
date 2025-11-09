import * as THREE from 'three/webgpu';
import { igeometry } from './track';
import Player from './player';
import utils from './utils';
import {
  bestTime,
  id,
  scene as oscene,
  refreshLeaderboard,
  resetPlayer,
  username,
} from './global';
import { sendMsg } from './network';

const fpsDisplay = document.getElementById('fps');
const timeDisplay = document.getElementById('time');

const bestTimeDisplay = document.getElementById('besttime');
const lastTimeDisplay = document.getElementById('lasttime');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0);
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.rotation.order = 'YXZ';
camera.position.set(0, 1.75, 3);
export const renderer = new THREE.WebGPURenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 2);
light.position.set(0.5, 1, 1);
scene.add(light);

const ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 0.75);
scene.add(ambientLight);

const checkpoint1 = new THREE.Mesh(
  new THREE.BoxGeometry(5, 2, 0.2),
  new THREE.MeshLambertMaterial({
    color: new THREE.Color(0, 0, 1),
    opacity: 0.5,
    transparent: true,
    depthWrite: false,
  }),
);
checkpoint1.position.y = 4.05;
scene.add(checkpoint1);

const checkpoint2 = new THREE.Mesh(
  new THREE.BoxGeometry(5, 2, 0.2),
  new THREE.MeshLambertMaterial({
    color: new THREE.Color(0, 0, 1),
    opacity: 0.5,
    transparent: true,
    depthWrite: false,
  }),
);
checkpoint2.position.y = 1;
scene.add(checkpoint2);

let fpsc = 0;
let fps = 0;

const imaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color(0.75, 0.75, 0.75),
  side: THREE.DoubleSide,
});
const infinityMesh = new THREE.Mesh(igeometry, imaterial);
scene.add(infinityMesh);
infinityMesh.position.y = 0.001;

const cpuTimes: number[] = [];

const player = new Player(0, 0.25, 0);
player.addTo(scene);

const clock = new THREE.Clock();

const menuButton = document.getElementById('menubtn') as HTMLButtonElement;

resetPlayer.v = () => {
  player.pos = { x: 0, y: 0.25, z: 0 };
  player.vel = { x: 0, y: 0, z: 0 };
  time = 0;
  started = false;
  checkpoint = 0;
  player.followPos = new THREE.Vector3(0, 0, 3);
  player.followQuat = new THREE.Quaternion();
  player.mesh.quaternion.set(0, 0, 0, 1);
};

function tick() {
  if (started) time += 1 / 100;

  const moved = player.tick();
  if (moved) started = true;

  if (started && checkpoint == 0) {
    checkpoint = 1;
  }

  if (
    checkpoint == 1 &&
    player.pos.x + 0.25 > checkpoint1.position.x - 2.5 &&
    player.pos.x - 0.25 < checkpoint1.position.x + 2.5 &&
    player.pos.y > checkpoint1.position.y - 1 &&
    player.pos.y < checkpoint1.position.y + 1 &&
    player.pos.z + 0.25 > checkpoint1.position.z - 0.1 &&
    player.pos.z - 0.25 < checkpoint1.position.z + 0.1
  ) {
    checkpoint = 2;
  }

  if (
    checkpoint == 2 &&
    player.pos.x + 0.25 > checkpoint2.position.x - 2.5 &&
    player.pos.x - 0.25 < checkpoint2.position.x + 2.5 &&
    player.pos.y > checkpoint2.position.y - 1 &&
    player.pos.y < checkpoint2.position.y + 1 &&
    player.pos.z + 0.25 > checkpoint2.position.z - 0.1 &&
    player.pos.z - 0.25 < checkpoint2.position.z + 0.1
  ) {
    checkpoint = 0;

    lastTime = time;

    if (lastTimeDisplay)
      lastTimeDisplay.textContent = `LAST TIME: ${Math.round(time * 100) / 100}`;

    if (bestTime.v == null || lastTime < bestTime.v) {
      bestTime.v = time;
      if (bestTimeDisplay)
        bestTimeDisplay.textContent = `BEST TIME: ${Math.round(time * 100) / 100}`;
      if (lastTimeDisplay) lastTimeDisplay.textContent += ' (NEW BEST!)';

      localStorage.setItem('besttime', time + '');

      if (time <= 100)
        sendMsg({ time: { id: id.v, username: username.v, time } });

      const bestTimeMenuDisplay = document.getElementById('besttimemenu');
      if (bestTimeMenuDisplay && bestTime.v != null)
        bestTimeMenuDisplay.textContent = `BEST TIME: ${Math.round(bestTime.v * 100) / 100}`;
    }

    time = 0;
  }
}

const tickrate = 100;
let accumulator = 0;

let time = 0;

let started = false;

let checkpoint = 0;

let lastTime: number | null = null;

export function renderGame(current: boolean) {
  const start = performance.now();
  fpsc++;

  utils.delta = clock.getDelta();

  accumulator = utils.constantTick(tick, tickrate, accumulator);

  if (current) player.visualUpdate(camera, tickrate, accumulator);

  checkpoint1.visible = checkpoint == 1;
  checkpoint2.visible = checkpoint == 2;

  renderer.render(scene, camera);

  cpuTimes.push(performance.now() - start);

  if (cpuTimes.length > 200) cpuTimes.splice(0, 1);

  let avg = 0;
  for (const time of cpuTimes) {
    avg += time;
  }

  avg /= cpuTimes.length;

  if (fpsDisplay)
    fpsDisplay.innerHTML = `FPS: ${fps} <br> CPU time: ${Math.round(avg * 100) / 100}ms (${Math.round(1000 / avg)} FPS)`;
  if (timeDisplay)
    timeDisplay.textContent = `TIME: ${Math.round(time * 100) / 100}`;
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// document.addEventListener('mousedown', (event: MouseEvent) => {
//   if (event.button == 0) {
//     renderer.domElement.requestPointerLock();
//   }
// });

// const sensitivity = 0.001;

// document.addEventListener('mousemove', (event: MouseEvent) => {
//   if (document.pointerLockElement == renderer.domElement) {
//     player.followQuat.multiply(
//       new THREE.Quaternion().setFromAxisAngle(
//         new THREE.Vector3(0, 1, 0),
//         event.movementX * sensitivity,
//       ),
//     );
//   }
// });

setInterval(() => {
  fps = fpsc;
  fpsc = 0;
}, 1000);

menuButton.onclick = () => {
  resetPlayer.v();
  setTimeout(() => {
    oscene.v = 'menu';
    refreshLeaderboard.v();
    menuButton.blur();
  });
};

document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.code == 'KeyR') {
    resetPlayer.v();
  }
});
