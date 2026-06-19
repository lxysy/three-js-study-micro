import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import { SimplexNoise } from "three/examples/jsm/Addons.js";
import loadTree from "./tree";

const geometry = new THREE.PlaneGeometry(3000, 3000, 100, 100);

const simplex = new SimplexNoise();
const noise2D = createNoise2D();

const positions = geometry.attributes.position;

for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);

  // const z = noise2D(x / 800, y / 800) * 50;
  const z = simplex.noise(x / 800, y / 800) * 50;
  positions.setZ(i, z);
}

// 根据顶点坐标、高度差自定义顶点颜色 geometry.attributes.color，实现根据不同的高度来设置不同颜色
const heightArr = [];
for (let i = 0; i < positions.count; i++) {
  heightArr.push(positions.getZ(i));
}
heightArr.sort();

const colorArr = [];
const color1 = new THREE.Color("#eee");
const color2 = new THREE.Color("white");
const minHeight = heightArr[0];
const maxHeight = heightArr[heightArr.length - 1];
const height = maxHeight - minHeight;
// 算渐变色
for (let i = 0; i < positions.count; i++) {
  const precent = (positions.getZ(i) - minHeight) / height;
  const c = color1.clone().lerp(color2, precent);
  colorArr.push(c.r, c.g, c.b);
}
const colors = new Float32Array(colorArr);
geometry.attributes.color = new THREE.BufferAttribute(colors,3);

const material = new THREE.MeshLambertMaterial({
  vertexColors: true,
  // color: new THREE.Color("white"),
  // wireframe: true,
});

const mountainside = new THREE.Mesh(geometry, material);
mountainside.rotateX(-Math.PI / 2);
mountainside.receiveShadow = true;

loadTree((tree) => {
  let i = 0;
  while (i < positions.count) {
    const newTree = tree.clone();
    newTree.position.x = positions.getX(i);
    newTree.position.y = positions.getY(i);
    newTree.position.z = positions.getZ(i);
    mountainside.add(newTree);
    // 右手坐标系，这里是逆时针
    newTree.rotateX(Math.PI / 2);

    i += Math.floor(500 * Math.random());
  }
});

export default mountainside;
