import * as THREE from 'three';

// 第三、四个参数就是宽和高的分段数
const geometry = new THREE.PlaneGeometry(100, 100, 2, 3);

const material = new THREE.MeshBasicMaterial(({
    color: new THREE.Color('orange'),
    wireframe: true
}));

const mesh = new THREE.Mesh(geometry, material);

console.log(mesh);

export default mesh;