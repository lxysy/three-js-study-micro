import * as THREE from "three";

const boxGeometry = new THREE.BoxGeometry(100, 100, 100);
// BoxGeometry 想渲染线模型，不能直接用，要用 EdgesGeometry 转换成线框模型才行
const geometry = new THREE.EdgesGeometry(boxGeometry);

// LineDashedMaterial 虚线材质
const material = new THREE.LineDashedMaterial({
  color: new THREE.Color("orange"),
  dashSize: 10,
  gapSize: 10,
});

const line = new THREE.Line(geometry, material);
// 计算虚线
line.computeLineDistances();

console.log(line);

export default line;
