import * as THREE from "three";

/**
 * Sprite 不能渲染 dom，其余的 CSS2DObject 很类似。
  再就是 Sprite 做标注可以随着 3D 场景放缩，而 CSS2DObject 不可以。
 */
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("skyblue"),
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-Math.PI / 2);
plane.position.y = -50;

const boxGeometry = new THREE.BoxGeometry(100, 100, 100);
const boxMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color("orange"),
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);

const box2 = box.clone();
box2.position.x = 200;

const mesh = new THREE.Group();
mesh.add(plane);
mesh.add(box);
mesh.add(box2);

// 利用canvas画图来创建纹理
// const texture = new THREE.CanvasTexture(createCanvas("aaa"));

// const spriteMaterial = new THREE.SpriteMaterial({
//   // color: "lightgreen",
//   map: texture,
// });
// const tag1 = new THREE.Sprite(spriteMaterial);
// tag1.scale.set(80, 50);
// tag1.position.y = 100;
// box.add(tag1);
// const tag2 = new THREE.Sprite(spriteMaterial);
// tag2.scale.set(80, 50);
// tag2.position.y = 100;
// box2.add(tag2);

function createCanvas(text, img) {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 80);
  const h = (canvas.height = 50);

  // canvas坐标系是以画布的左上角为原点(0, 0)，水平向右为X轴，垂直向下为Y轴，以像素为单位
  const c = canvas.getContext("2d");
  // c.fillStyle = "white";
  // c.fillRect(0, 0, w, h);

  // c.fillStyle = "green";
  // c.fillRect(10, 10, w - 20, h - 20);

  // 画出图片
  c.drawImage(img, 0, 0, w, h);

  c.translate(w / 2, h / 2);
  c.fillStyle = "#ffffff";
  c.font = "normal 24px 微软雅黑";
  c.textBaseline = "middle";
  c.textAlign = "center";
  c.fillText(text, 0, 0);
  return canvas;
}

// 使用canvas画图
const img = new Image();
img.src = "./heart.png";
img.onload = function () {
  const texture = new THREE.CanvasTexture(createCanvas("aaa", img));

  const spriteMaterial = new THREE.SpriteMaterial({
    // color: 'lightgreen'
    map: texture,
  });

  const tag1 = new THREE.Sprite(spriteMaterial);
  tag1.scale.set(80, 50);
  tag1.position.y = 100;
  box.add(tag1);

  const tag2 = new THREE.Sprite(spriteMaterial);
  tag2.scale.set(80, 50);
  tag2.position.y = 100;
  box2.add(tag2);
};

export default mesh;
