import * as THREE from "three";

const player = new THREE.Group();

function createCanvas() {
  const dpr = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  // 创建一个 100x100 像素的 canvas 元素;宽高乘以 DPR 以适应高分辨率屏幕
  const w = (canvas.width = 100 * dpr);
  const h = (canvas.height = 100 * dpr);

  // 将坐标原点移动到画布中心，方便从中心开始绘图
  const c = canvas.getContext("2d");
  c.translate(w / 2, h / 2);

  c.arc(0, 0, 40 * dpr, 0, Math.PI * 2);
  c.fillStyle = "orange";
  c.fill();

  c.beginPath();
  c.moveTo(-10 * dpr, -20 * dpr);
  c.lineTo(-10 * dpr, 20 * dpr);
  c.lineTo(20 * dpr, 0);
  c.closePath();
  c.fillStyle = "white";
  c.fill();
  return canvas;
}

// 暂停按钮贴图
function createCanvas2() {
  const dpr = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 100 * dpr);
  const h = (canvas.height = 100 * dpr);

  const c = canvas.getContext("2d");
  c.translate(w / 2, h / 2);

  c.arc(0, 0, 40 * dpr, 0, Math.PI * 2);
  c.fillStyle = "orange";
  c.fill();

  c.beginPath();
  c.moveTo(-10 * dpr, -20 * dpr);
  c.lineTo(-10 * dpr, 20 * dpr);
  c.moveTo(10 * dpr, -20 * dpr);
  c.lineTo(10 * dpr, 20 * dpr);
  // c.closePath();
  c.lineWidth = 10;
  c.lineCap = "round";
  c.strokeStyle = "white";
  c.stroke();
  return canvas;
}

function createBtn() {
  const texture = new THREE.CanvasTexture(createCanvas());
  const geometry = new THREE.BoxGeometry(100, 80, 100);
  const material = new THREE.MeshPhysicalMaterial({
    color: "white",
    // map: texture,
    roughness: 0.3,
  });
  const btn = new THREE.Mesh(geometry, material);

  // 只在顶部显示播放的贴图
  const g = new THREE.PlaneGeometry(100, 100);
  const m = new THREE.MeshPhysicalMaterial({
    color: "white",
    map: texture,
    transparent: true,
    roughness: 0.3,
  });
  const plane = new THREE.Mesh(g, m);
  plane.rotateX(-Math.PI / 2);
  // 解决深度冲突导致闪烁问题
  plane.position.y = 41;
  btn.add(plane);
  // rget 属性，这样点到上面的平面也可以通过 target 拿到按钮对象
  plane.target = btn;
  btn.target = btn;

  return btn;
}

const playBtn = createBtn();
playBtn.name = "playBtn";
player.add(playBtn);

const pauseBtn = createBtn();
const texture = new THREE.CanvasTexture(createCanvas2());
pauseBtn.children[0].material.map = texture;
pauseBtn.position.x = 200;
pauseBtn.name = "pauseBtn";
player.add(pauseBtn);

export default player;
