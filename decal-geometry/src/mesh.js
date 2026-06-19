import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/Addons.js";

const group = new THREE.Group();

// const geometry = new THREE.SphereGeometry(200);
// 正十二面体
const geometry = new THREE.DodecahedronGeometry(200);
const material = new THREE.MeshPhongMaterial({
  color: "orange",
});
const mesh = new THREE.Mesh(geometry, material);
group.add(mesh);

const loader = new THREE.TextureLoader();
const texture = loader.load("./xiaoxin.png");
texture.colorSpace = THREE.SRGBColorSpace;

// 添加一个 decal 贴花 到 sphere 上
const position = new THREE.Vector3(0, 0, 200); // 贴花在球体表面的位置（球体半径 200，位于 Z 轴正方向顶点）
const orientation = new THREE.Euler(); // 贴花的朝向（欧拉角），默认 (0,0,0) 即贴花正面朝向 Z 轴正方向
const size = new THREE.Vector3(100, 100, 100);
// DecalGeometry 是附在另一个网格模型表面，所以要传入 mesh 以及位置、角度、大小
const geometry2 = new DecalGeometry(mesh, position, orientation, size);
const material2 = new THREE.MeshPhongMaterial({
  polygonOffset: true, // 启用深度偏移，解决贴花与球体表面深度冲突（Z-fighting）
  polygonOffsetFactor: -4, // 偏移量因子，负值表示将片元向相机方向拉近，确保贴花覆盖在球体之上
  // color: 'green',

  map: texture,
  // 默认情况下，Three.js 的材质是不透明的，即使贴图（map）中有透明/半透明的像素，也会被忽略，当作不透明处理
  transparent: true,
});
const mesh2 = new THREE.Mesh(geometry2, material2);
group.add(mesh2);

// 显示贴花的投影盒子（调试用）
export function showBoxHelper(size, position, orientation) {
  // BoxGeometry 的尺寸对应 DecalGeometry 的 size，表示投影盒子的长宽高
  const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
  // EdgesGeometry 从 BoxGeometry 中提取棱边线段，只保留线框不显示面
  const boxEdges = new THREE.EdgesGeometry(boxGeo);
  // LineSegments 将棱边渲染为线段，这里用半透明绿色方便观察
  const boxHelper = new THREE.LineSegments(
    boxEdges,
    new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.6,
    }),
  );
  boxHelper.position.copy(position);
  boxHelper.rotation.copy(orientation);
  group.add(boxHelper);
}

showBoxHelper(size, position, orientation);

export default group;
