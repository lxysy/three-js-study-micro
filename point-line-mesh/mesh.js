import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
    0, 0, 0,
    100, 0, 0,
    0, 100, 0,
    100, 100, 0
]);

const attribute = new THREE.BufferAttribute(vertices, 3);
geometry.attributes.position = attribute;

// 从相机看过去的方向，如果一个三角形是逆时针连接的顶点，就是正面，顺时针就是反面
const indexes = new Uint16Array([
    // 0, 1, 2, 2, 1, 3
    0, 1, 2, 2, 3, 1
]);
geometry.index = new THREE.BufferAttribute(indexes, 1);

const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('orange'),
    // 双面可见
    side: THREE.DoubleSide
});

const mesh = new THREE.Mesh(geometry, material);

export default mesh;