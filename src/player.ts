import * as THREE from 'three/webgpu';
import utils from './utils';
import { keys } from './keys';
import { cpoints } from './track';

const tdelta = 1 / 100;

const gravity = 10;

const speed = 30;

//

export default class Player {
  lpos: { x: number; y: number; z: number };
  pos: { x: number; y: number; z: number };
  vpos: { x: number; y: number; z: number };
  vel: { x: number; y: number; z: number };
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  line1: THREE.Mesh;
  line2: THREE.Mesh;
  line3: THREE.Mesh;
  followPos: THREE.Vector3;
  followQuat: THREE.Quaternion;
  lfollowPos: THREE.Vector3;
  lfollowQuat: THREE.Quaternion;
  constructor(x: number, y: number, z: number) {
    this.pos = { x, y, z };
    this.lpos = { ...this.pos };
    this.vpos = { ...this.pos };

    this.followPos = new THREE.Vector3(0, 0, 3);
    this.followQuat = new THREE.Quaternion();

    this.lfollowPos = new THREE.Vector3().copy(this.followPos);
    this.lfollowQuat = new THREE.Quaternion().copy(this.followQuat);

    this.vel = { x: 0, y: 0, z: 0 };

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.25),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(0.7, 0.9, 1) }),
    );
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);

    this.line1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.275, 0.275, 0.05),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(0, 0.5, 1) }),
    );
    this.mesh.add(this.line1);

    this.line2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.275, 0.275, 0.05),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(0, 0.5, 1) }),
    );
    this.line2.rotation.z = Math.PI / 2;
    this.mesh.add(this.line2);

    this.line3 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.275, 0.275, 0.05),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(0, 0.5, 1) }),
    );
    this.line3.rotation.x = Math.PI / 2;
    this.mesh.add(this.line3);

    this.light = new THREE.PointLight(new THREE.Color(0, 0.5, 1), 0.5, 2, 2);
    this.mesh.add(this.light);
  }
  addTo(scene: THREE.Scene) {
    scene.add(this.mesh);
  }
  updateMesh() {
    this.mesh.position.set(this.vpos.x, this.vpos.y, this.vpos.z);
  }
  visualUpdate(
    camera: THREE.PerspectiveCamera,
    tickrate: number,
    accumulator: number,
  ) {
    this.vpos = {
      x: utils.interpVar(this.pos.x, this.lpos.x, tickrate, accumulator),
      y: utils.interpVar(this.pos.y, this.lpos.y, tickrate, accumulator),
      z: utils.interpVar(this.pos.z, this.lpos.z, tickrate, accumulator),
    };

    this.updateMesh();

    const interp = accumulator / (1 / tickrate);
    const vfollowpos = new THREE.Vector3()
      .copy(this.lfollowPos)
      .lerp(this.followPos, interp);

    camera.position.x = utils.lerp5(
      camera.position.x,
      vfollowpos.x,
      utils.delta * 15,
    );
    camera.position.y = utils.lerp5(
      camera.position.y,
      this.vpos.y + 1.5,
      utils.delta * 15,
    );
    camera.position.z = utils.lerp5(
      camera.position.z,
      vfollowpos.z,
      utils.delta * 15,
    );

    const dummy = new THREE.Object3D();
    dummy.position.copy(this.vpos);
    dummy.lookAt(camera.position);

    const multiply = 1 - (1 - 0.5) ** (utils.delta * 10);
    camera.quaternion.slerp(dummy.quaternion, multiply);

    this.mesh.quaternion.copy(
      new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.vel.z * utils.delta)
        .multiply(this.mesh.quaternion),
    );

    this.mesh.quaternion.copy(
      new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(0, 0, 1), -this.vel.x * utils.delta)
        .multiply(this.mesh.quaternion),
    );
  }
  tick() {
    this.lpos = { ...this.pos };

    this.vel.y -= gravity * tdelta;

    //

    this.lfollowPos.copy(this.followPos);
    this.lfollowQuat.copy(this.followQuat);

    const hoverxz = 2;
    const xzlength = Math.sqrt(
      (this.followPos.x - this.pos.x) ** 2 +
        (this.followPos.z - this.pos.z) ** 2,
    );
    const nearest = {
      x: this.pos.x + ((this.followPos.x - this.pos.x) / xzlength) * hoverxz,
      z: this.pos.z + ((this.followPos.z - this.pos.z) / xzlength) * hoverxz,
    };
    this.followPos.x = utils.lerp5(this.followPos.x, nearest.x, tdelta * 20);
    this.followPos.z = utils.lerp5(this.followPos.z, nearest.z, tdelta * 20);

    const targetQuaternion = new THREE.Quaternion();
    const dummy = new THREE.Object3D();
    const targetPoint = new THREE.Vector3(
      this.followPos.x * 2 - this.pos.x,
      this.followPos.y,
      this.followPos.z * 2 - this.pos.z,
    );

    dummy.position.copy(this.followPos);
    dummy.lookAt(targetPoint);
    targetQuaternion.copy(dummy.quaternion);

    const multiply = 1 - (1 - 0.5) ** (tdelta * 50);
    this.followQuat.slerp(targetQuaternion, multiply);

    //

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.followQuat);

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.followQuat);

    let moved = false;

    if (keys.KeyW || keys.ArrowUp) {
      this.vel.x -= speed * tdelta * forward.x;
      this.vel.z -= speed * tdelta * forward.z;
      moved = true;
    }
    if (keys.KeyS || keys.ArrowDown) {
      this.vel.x += speed * tdelta * forward.x;
      this.vel.z += speed * tdelta * forward.z;
      moved = true;
    }

    if (keys.KeyA || keys.ArrowLeft) {
      this.vel.x -= speed * tdelta * right.x;
      this.vel.z -= speed * tdelta * right.z;
      moved = true;
    }
    if (keys.KeyD || keys.ArrowRight) {
      this.vel.x += speed * tdelta * right.x;
      this.vel.z += speed * tdelta * right.z;
      moved = true;
    }

    this.pos.x += this.vel.x * tdelta;
    this.pos.y += this.vel.y * tdelta;
    this.pos.z += this.vel.z * tdelta;

    this.vel.x = utils.lerp5(this.vel.x, 0, tdelta * 5);
    this.vel.z = utils.lerp5(this.vel.z, 0, tdelta * 5);

    let grounded = false;

    for (let i = 0; i < cpoints.length; i++) {
      if (
        Math.sqrt(
          (this.pos.x - cpoints[i].x) ** 2 + (this.pos.z - cpoints[i].z) ** 2,
        ) < 2 &&
        this.pos.y < -cpoints[i].y + 0.25 &&
        this.pos.y > -cpoints[i].y - 0.5
      ) {
        this.vel.y += (-cpoints[i].y + 0.25 - this.pos.y) * tdelta * 50;
        grounded = true;
      }
    }

    if (grounded) this.vel.y = utils.lerp5(this.vel.y, 0, tdelta * 20);

    if (this.pos.y < -10) {
      this.pos.x = 0;
      this.pos.y = 0.25;
      this.pos.z = 0;
      this.vel.x = 0;
      this.vel.y = 0;
      this.vel.z = 0;
    }

    return moved;
  }
}
