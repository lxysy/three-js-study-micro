import * as THREE from "three";

const group = new THREE.Group();

// 画坐标轴
function createLine(type) {
  const points = [
    new THREE.Vector3(0, 0, 0),
    type === "y" ? new THREE.Vector3(0, 100, 0) : new THREE.Vector3(100, 0, 0),
  ];
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({
    color: "#ffffff",
  });
  geometry.setFromPoints(points);

  const line = new THREE.Line(geometry, material);
  return line;
}

// 画刻度
function createScaleLine(type) {
  const points = [];
  for (let i = 0; i <= 100; i += 10) {
    if (type === "y") {
      points.push(new THREE.Vector3(0, i, 0));
      points.push(new THREE.Vector3(-5, i, 0));
    } else {
      points.push(new THREE.Vector3(i, 0, 0));
      points.push(new THREE.Vector3(i, -5, 0));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: "#ffffff",
  });
  const scaleLine = new THREE.LineSegments(geometry, material);
  return scaleLine;
}

// 画柱状图
function createBar(dataArr) {
  const bars = new THREE.Group();

  dataArr.forEach((item, i) => {
    const geometry = new THREE.PlaneGeometry(10, item, 1, 20);
    const material = new THREE.MeshBasicMaterial({
      // color: "orange",
      vertexColors: true,
    });
    const positions = geometry.attributes.position;
    const height = 100;

    const colorsArr = [];
    const color1 = new THREE.Color("green");
    const color2 = new THREE.Color("blue");
    const color3 = new THREE.Color("red");
    for (let i = 0; i < positions.count; i++) {
      // 通过 positions.getY(i) + item/2，将顶点 Y 坐标范围转换为 [0, item]。这相当于以柱子底部为原点（0），顶部为 item
      // 比如PlaneGeometry创建时中心在原点，此时上下顶点y的范围为[-35,35]，这里转换为[0,70]
      const percent = (positions.getY(i) + item / 2) / height;
      // const c = color1.clone().lerp(color2, percent);
      // colorsArr.push(c.r, c.g, c.b);

      // 多个颜色设置渐变
      const y = positions.getY(i) + item / 2;
      if (y <= 50) {
        const percent = y / 50;
        const c = color1.clone().lerp(color2, percent);
        colorsArr.push(c.r, c.g, c.b);
      } else if (y > 50 && y <= 100) {
        const percent = (y - 50) / 50;
        console.log(percent);
        const c = color2.clone().lerp(color3, percent);
        colorsArr.push(c.r, c.g, c.b);
      }
    }
    const colors = new Float32Array(colorsArr);
    geometry.attributes.color = new THREE.BufferAttribute(colors, 3);

    const bar = new THREE.Mesh(geometry, material);
    // PlaneGeometry的xy为图形中心位置,间隔10放一个，再加上本身宽度的一半
    bar.position.x = 10 + i * 20 + 5;
    bar.position.y = item / 2;
    bars.add(bar);
  });

  bars.add(createNum(dataArr));
  return bars;
}

// 画数字
function createNum(dataArr) {
  const nums = new THREE.Group();
  dataArr.forEach((item, i) => {
    // 用 CanvasTexture 创建纹理，作为矩形平面的颜色贴图
    const texture = new THREE.CanvasTexture(createCanvas(item));
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({
      // color: 'orange'
      map: texture,
    });
    const num = new THREE.Mesh(geometry, material);
    num.position.y = item + 10;
    num.position.x = 10 + i * 20 + 5;
    nums.add(num);
  });
  return nums;
}
function createCanvas(text) {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 100);
  const h = (canvas.height = 100);

  const c = canvas.getContext("2d");
  // 画布宽高 100 * 100，字体大小 48，把坐标原点移到画布中心，然后写个数字
  c.translate(w / 2, h / 2);
  c.fillStyle = "#ffffff";
  c.font = "normal 48px 宋体";
  c.textBaseline = "middle";
  c.textAlign = "center";
  c.fillText(text, 0, 0);
  return canvas;
}

const xLine = createLine("x");
const yLine = createLine("y");

const xScaleLine = createScaleLine("x");
const yScaleLine = createScaleLine("y");

const bar = createBar([70, 20, 80, 40, 50]);
console.log(bar);
group.add(xLine, yLine, xScaleLine, yScaleLine, bar);

export default group;
