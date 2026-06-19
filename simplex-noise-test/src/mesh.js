import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/Addons.js";

const geometry = new THREE.PlaneGeometry(3000, 3000, 200, 200);

const simplex = new SimplexNoise();

const positions = geometry.attributes.position;

for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);

  // Simplex 噪声算法生成的伪随机值范围通常为 [-1, 1]，通过输入坐标生成平滑、自然的连续值。
  // 将原始坐标 x 和 y 除以 1000，相当于放大噪声的采样步长。
  // 数值越大（如 1000），噪声的 频率越低，生成的图案更平缓（如广阔的山脉）。
  // 数值越小（如 10），噪声的 频率越高，生成的图案更密集（如细小的砂石纹路）。
  // 频率 + 振幅，这里的300就是振幅
  let z = simplex.noise(x / 1000, y / 1000) * 300;
  z += simplex.noise(x / 400, y / 400) * 100;
  z += simplex.noise(x / 200, y / 200) * 50;

  positions.setZ(i, z);
}

const material = new THREE.MeshBasicMaterial({
  color: new THREE.Color("orange"),
  wireframe: true,
});

const mesh = new THREE.Mesh(geometry, material);
mesh.rotateX(-Math.PI / 2);
console.log(mesh);

export default mesh;
