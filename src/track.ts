import * as THREE from 'three/webgpu';

class InfinityCurve2D extends THREE.Curve<THREE.Vector2> {
  constructor(private scale = 20) {
    super();
  }

  getPoint(t: number): THREE.Vector2 {
    const angle = 2 * Math.PI * t;
    const x =
      (this.scale * Math.cos(angle)) / (1 + Math.sin(angle) * Math.sin(angle));
    const y =
      (this.scale * Math.sin(angle) * Math.cos(angle)) /
      (1 + Math.sin(angle) * Math.sin(angle));
    return new THREE.Vector2(x, y);
  }
}

const infinityCurve = new InfinityCurve2D(10);
const segments = 200;
const points = infinityCurve.getPoints(segments);
const halfWidth = 2;

const positions: number[] = [];
const normals: number[] = [];
const uvs: number[] = [];
const indices: number[] = [];

export const cpoints: THREE.Vector3[] = [];

for (let i = 0; i < segments; i++) {
  const p = points[i];

  const nextP = points[(i + 1) % segments];

  const tangent = nextP.clone().sub(p).normalize();
  const normal = new THREE.Vector2(-tangent.y, tangent.x);

  const t = Math.max(1 - (Math.abs(segments / 4 - i) / segments) * 4, 0);

  const y = -3 * (3 * t ** 2 - 2 * t ** 3);

  const v1 = p.clone().addScaledVector(normal, -halfWidth);
  positions.push(v1.x, v1.y, y);
  normals.push(0, 1, 0);
  uvs.push(i / segments, 0);

  const v2 = p.clone().addScaledVector(normal, halfWidth);
  positions.push(v2.x, v2.y, y);
  normals.push(0, 1, 0);
  uvs.push(i / segments, 1);

  cpoints.push(new THREE.Vector3((v1.x + v2.x) / 2, y, (v1.y + v2.y) / 2));

  if (i < segments) {
    const baseIndex = i * 2;
    indices.push(baseIndex, baseIndex + 1, (baseIndex + 2) % (segments * 2));
    indices.push(
      baseIndex + 1,
      (baseIndex + 3) % (segments * 2),
      (baseIndex + 2) % (segments * 2),
    );
  }
}

export const igeometry = new THREE.BufferGeometry();
igeometry.setIndex(indices);
igeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(new Float32Array(positions), 3),
);
igeometry.setAttribute(
  'normal',
  new THREE.BufferAttribute(new Float32Array(normals), 3),
);
igeometry.setAttribute(
  'uv',
  new THREE.BufferAttribute(new Float32Array(uvs), 2),
);
igeometry.rotateX(Math.PI / 2);
igeometry.computeVertexNormals();
