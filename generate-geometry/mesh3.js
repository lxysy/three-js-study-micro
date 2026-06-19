import * as THREE from "three";

// const pointsArr = [
//   new THREE.Vector2(100, 0),
//   new THREE.Vector2(50, 20),
//   new THREE.Vector2(0, 0),
//   new THREE.Vector2(0, 50),
//   new THREE.Vector2(50, 100),
// ];
// 自定义多边形
// const shape = new THREE.Shape(pointsArr);

// 另一种定义方式，按顺序画线
const shape = new THREE.Shape();
shape.moveTo(100, 0);
shape.lineTo(0, 0);
shape.lineTo(0, 50);
shape.lineTo(80, 100);

// 挖孔
const path = new THREE.Path();
path.arc(50, 50, 10);
shape.holes.push(path);

// const geometry = new THREE.ShapeGeometry(shape);
// 拉伸多边形，形成几何体 这里传入 shape 或者 path 对象都行，因为 Shape 是 Path 的子类
const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 100
});
const material = new THREE.MeshLambertMaterial({
  color: new THREE.Color("lightgreen"),
});

const mesh = new THREE.Mesh(geometry, material);

export default mesh;
