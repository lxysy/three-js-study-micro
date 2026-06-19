import * as THREE from 'three';

// 第一参数是上圆的半径，第二个是下圆的半径，第三个参数是高度 第四第五圆个参数 分段数 默认32、高度的分段数是 默认1
const geometry = new THREE.CylinderGeometry(50, 50, 80);

const material = new THREE.MeshBasicMaterial(({
    color: new THREE.Color('orange'),
    wireframe: true,
}));

const mesh = new THREE.Mesh(geometry, material);

export default mesh;