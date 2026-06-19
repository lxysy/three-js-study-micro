import * as THREE from "three";

// const geometry = new THREE.BoxGeometry(100, 100, 100);
const geometry = new THREE.DodecahedronGeometry(100);
const material = new THREE.MeshLambertMaterial({
  color: new THREE.Color("orange"),
});
const mesh = new THREE.Mesh(geometry, material);

console.log(mesh);

// 可视化向量
const positions = geometry.getAttribute("position");
const normals = geometry.getAttribute("normal");

for (let i = 0; i < positions.count; i++) {
  const origin = new THREE.Vector3(
    positions.getX(i),
    positions.getY(i),
    positions.getZ(i)
  );
  const dir = new THREE.Vector3(
    normals.getX(i),
    normals.getY(i),
    normals.getZ(i)
  );

  const helper = new THREE.ArrowHelper(dir, origin, 100, "red");
  mesh.add(helper);
}

const mesh2 = new THREE.Mesh(geometry, material);
mesh2.position.set(300, 0, 0);
const mesh3 = new THREE.Mesh(geometry, material);
mesh3.position.set(800, 0, 0);
mesh.add(mesh2, mesh3);

// 除了加减乘除外，我们还经常需要计算两个点之间的距离，这个用两个向量相减，然后取 length 就行。
console.log(mesh2.position.sub(mesh.position).length());
console.log(mesh3.position.sub(mesh2.position).length());

export default mesh;
