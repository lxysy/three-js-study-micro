import * as THREE from "three";

const group = new THREE.Group();

/**
 * 这里为啥平面宽高 100 * 100，而 canvas 要创建 200* 200 的大小呢？
 * 与设备像素比 dpr 有关，如果你的 dpr 为 2 ，那就需要画两倍大小的 canvas 作为纹理才不会模糊。
 * 这里最好不要写死，而是动态的来算
 */
function createCanvas() {
  // 物理像素与逻辑像素（或CSS像素）的比率
  const dpr = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  // const w = (canvas.width = 200);
  // const h = (canvas.height = 200);
  // 通过乘以DPR，Canvas的尺寸会根据设备的分辨率进行缩放，以确保在不同设备上显示一致,贴图也会更清楚
  const w = (canvas.width = 100 * dpr);
  const h = (canvas.height = 100 * dpr);

  const c = canvas.getContext("2d");
  // 将Canvas的坐标系平移到其中心点
  c.translate(w / 2, h / 2);
  // 画圆 原点 半径 弧度
  c.arc(0, 0, 40 * dpr, 0, Math.PI * 2);
  c.fillStyle = "orange";
  c.fill();

  // 画三角形 (-10,20) (-10,-20) (20,0)三点
  c.beginPath();
  c.moveTo(-10 * dpr, -20 * dpr);
  c.lineTo(-10 * dpr, 20 * dpr);
  c.lineTo(20 * dpr, 0);
  c.closePath();
  c.fillStyle = "white";
  c.fill();
  return canvas;
}

// 画五角星 (0,-50) (30,50) (-50,10) (50,10) (-30,50)
function createCanvas2() {
  const dpr = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 100 * dpr);
  const h = (canvas.height = 100 * dpr);

  const ctx = canvas.getContext("2d");
  ctx.translate(w / 2, h / 2);

  ctx.moveTo(-50 * dpr, -10 * dpr);
  ctx.lineTo(50 * dpr, -10 * dpr);
  ctx.lineTo(-30 * dpr, 50 * dpr);
  ctx.lineTo(0 * dpr, -50 * dpr);
  ctx.lineTo(30 * dpr, 50 * dpr);
  ctx.lineTo(-50 * dpr, -10 * dpr);
  ctx.strokeStyle = "red";
  ctx.stroke();
  return canvas;
}

function createCanvas3() {
  const dpr = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 100 * dpr);
  const h = (canvas.height = 100 * dpr);

  const ctx = canvas.getContext("2d");
  ctx.moveTo(30 * dpr, 20 * dpr);
  ctx.beginPath();
  ctx.lineTo(50 * dpr, 0);
  ctx.lineTo(70 * dpr, 20 * dpr);
  ctx.lineTo(100 * dpr, 30 * dpr);
  ctx.lineTo(85 * dpr, 60 * dpr);
  ctx.lineTo(80 * dpr, 90 * dpr);
  ctx.lineTo(50 * dpr, 80 * dpr);
  ctx.lineTo(20 * dpr, 90 * dpr);
  ctx.lineTo(15 * dpr, 60 * dpr);
  ctx.lineTo(0, 30 * dpr);
  ctx.lineTo(30 * dpr, 20 * dpr);
  ctx.closePath();
  ctx.fillStyle = "red";
  ctx.fill();
  return canvas;
}

function createCanvas4(img) {
  const dpr = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 100 * dpr);
  const h = (canvas.height = 100 * dpr);

  const c = canvas.getContext("2d");
  c.drawImage(img, 0, 0, w, h);
  c.translate(w / 2, h / 2);
  c.fillStyle = "#ffffff";
  c.font = "normal 20px 微软雅黑";
  c.textBaseline = "middle";
  c.textAlign = "center";
  c.fillText("你好,guang", 0, 0);
  return canvas;
}

function createPlane(x, y, img) {
  const texture = new THREE.CanvasTexture(createCanvas4(img));
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(100, 100);
  const material = new THREE.MeshPhongMaterial({
    // color: "white",
    map: texture,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, 0);
  return mesh;
}

// group.add(createPlane(-300, 0));
// group.add(createPlane(0, 0));
// group.add(createPlane(300, 0));

const img = new Image();
img.src = "./heart.png";
img.onload = function () {
  group.add(createPlane(-300, 0, img));
  group.add(createPlane(0, 0, img));
  group.add(createPlane(300, 0, img));
};

export default group;
