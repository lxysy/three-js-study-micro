import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
    0, 0, 0,
    100, 0, 0,
    0, 100, 0,
    100, 100, -100
]);

const attribute = new THREE.BufferAttribute(vertices, 3);
geometry.attributes.position = attribute;

// 按照这个索引去连接点，这里就是两个三角面
const indexes = new Uint16Array([
    0, 1, 2, 2, 1, 3
]);
geometry.index = new THREE.BufferAttribute(indexes, 1);

// 虽然有 6 个顶点索引，但只有 4 个不重复的顶点，所以我们定义和 position 一一对应的 4 条法线就好。
// 这里自定义了四条法线
/**
 * 前三个法线 [0, 0, 1] 表示顶点 0、1、2 的法线方向都是沿着 z 轴正方向，
 * 最后一个法线 [1, 1, 0] 表示顶点 3 的法线方向是沿着 x 和 y 轴的正方向。
 * 对于平面几何体，法线通常垂直于面片。前三个顶点位于 z=0 的平面上，
 * 因此它们的法线方向是 [0, 0, 1]。而顶点 3 位于 z=-100 的位置，
 * 因此它的法线方向是 [1, 1, 0]，表示它所在的平面与 x 和 y 轴有一定的倾斜。法线向着xy这个面倾斜
 */
const normals = new Float32Array([
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  1, 1, 0
]);
geometry.attributes.normal = new THREE.BufferAttribute(normals, 3);

// MeshBasicMaterial，它并不处理光照
// 换成 MeshPhongMaterial 光滑的
// MeshLambertMaterial 漫反射材质
// 没有法线，它不知道每个顶点是什么方向的,就不会反射光线
const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color('orange'),
    shininess: 1000
});

const mesh = new THREE.Mesh(geometry, material);

export default mesh;