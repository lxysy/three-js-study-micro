import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/Addons.js";
import createLabel from "./label";

/**
 * @remarks
 * 先画了 1 条直线 LineCurve，然后画了一条曲线 EllipseCurve，之后再画一条直线，用 CurvePath 连接起来（顺序很重要）。
 * 之后从上面取 100 个点来生成 Shape。
 * 用这个 Shape 经过 ExtrudeGeometry 拉伸，形成几何体，创建网格模型
 */
const curvePath = new THREE.CurvePath();

const v1 = new THREE.Vector2(0, 0);
const v2 = new THREE.Vector2(0, 300);
const v3 = new THREE.Vector2(300, 0);

const line1 = new THREE.LineCurve(v1, v3);
curvePath.add(line1);

// 椭圆的中心坐标、半长轴和半短轴长度、起始角度、结束角度
const arc = new THREE.EllipseCurve(0, 0, 300, 300, 0, Math.PI / 2);
curvePath.add(arc);

const line2 = new THREE.LineCurve(v1, v2);
curvePath.add(line2);

const points = curvePath.getPoints(100);
const shape = new THREE.Shape(points);

const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 100,
});
const material = new THREE.MeshPhongMaterial({
  color: "orange",
});

const mesh = new THREE.Mesh(geometry, material);

let usedColor = [];
let colors = [
  "red",
  "pink",
  "blue",
  "purple",
  "orange",
  "lightblue",
  "green",
  "lightgreen",
];
/**
 * @remarks
 * 从 colors 数组里随机取一个下标的颜色返回，用过的颜色记录下来，如果随机到用过的就重新生成
 */
function getRandomColor() {
  let index = Math.floor(Math.random() * colors.length);
  while (usedColor.includes(index)) {
    index = Math.floor(Math.random() * colors.length);
  }
  usedColor.push(index);
  return colors[index];
}

// 根据数据计算角度并画饼图
const group = new THREE.Group();

const R = 300;
function createPieChart(data) {
  // 计算角度
  let total = 0;
  data.forEach((item) => {
    total += item.value;
  });

  const angles = data.map((item) => {
    return (item.value / total) * 360;
  });
  console.log(angles);

  // 开始画饼图
  let startAngle = 0;
  angles.map((angle, i) => {
    const curvePath = new THREE.CurvePath();

    // 角度化弧度
    const rad = THREE.MathUtils.degToRad(angle);

    const endAngle = startAngle + rad;

    const x1 = R * Math.cos(startAngle);
    const y1 = R * Math.sin(startAngle);

    const x2 = R * Math.cos(endAngle);
    const y2 = R * Math.sin(endAngle);

    const v1 = new THREE.Vector2(0, 0);
    const v2 = new THREE.Vector2(x1, y1);
    const v3 = new THREE.Vector2(x2, y2);

    const line1 = new THREE.LineCurve(v1, v2);
    curvePath.add(line1);

    const arc = new THREE.EllipseCurve(0, 0, R, R, startAngle, endAngle);
    curvePath.add(arc);

    const line2 = new THREE.LineCurve(v1, v3);
    curvePath.add(line2);

    const points = curvePath.getPoints(100);
    const shape = new THREE.Shape(points);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 100,
    });
    const material = new THREE.MeshPhongMaterial({
      color: getRandomColor(),
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // 自定义一个属性记录下扇形中间的角度
    mesh.angle = (endAngle + startAngle) / 2;

    // 添加标签
    const label = createLabel(data[i].name + ' ' + data[i].value);
    label.position.x = 200 * Math.cos(mesh.angle);
    label.position.y = 200 * Math.sin(mesh.angle);
    label.position.z = 150;
    mesh.add(label);

    // 将mesh添加到target，后续点击操作只对它做position变化
    label.target = mesh;
    mesh.target = mesh;

    startAngle += rad;
  });
}
const data = [
  {
    name: "春节销售额",
    value: 1000,
  },
  {
    name: "夏节销售额",
    value: 3000,
  },
  {
    name: "秋节销售额",
    value: 800,
  },
  {
    name: "冬节销售额",
    value: 500,
  },
];
createPieChart(data);

group.rotateX(-Math.PI / 2);

export default group;
