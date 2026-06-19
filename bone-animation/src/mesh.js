import * as THREE from "three";

// 用 Bone 创建了 3 个关节
const bone1 = new THREE.Bone();
const bone2 = new THREE.Bone();
const bone3 = new THREE.Bone();

bone1.add(bone2);
bone2.add(bone3);

bone1.position.x = 100;

bone2.position.y = 100;
bone3.position.y = 50;

// 因为 bone2 包含 bone3，那 bone3 的 position.y 就是在 bone2 的基础之上的，也就是 100 + 50。
const pos = new THREE.Vector3();
bone3.getWorldPosition(pos);

bone1.rotateZ(Math.PI / 4);
bone2.rotateZ(-Math.PI / 4);
// bone3.rotateZ(-Math.PI / 4);

console.log(pos);
const group = new THREE.Group();
group.add(bone1);

// 然后用 SkeletonHelper 可视化
const skeletonHelper = new THREE.SkeletonHelper(group);
group.add(skeletonHelper);

export default group;
