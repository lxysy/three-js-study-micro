import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/Addons";
import { Tween, Easing, Group } from "@tweenjs/tween.js";
import { throttle } from 'lodash-es';

function createCanvas() {
  const dpr = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 100 * dpr);
  const h = (canvas.height = 100 * dpr);

  const ctx = canvas.getContext("2d");
  //   统一缩放整个绘图上下文，这样所有坐标统一用逻辑像素，不用每个地方都手动乘 dpr，也更不容易出错。
  ctx.scale(dpr, dpr);
  ctx.translate(50, 50);

  ctx.moveTo(-20, 40);
  ctx.lineTo(-20, -10);
  ctx.lineTo(20, -10);
  ctx.lineTo(20, 30);

  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "yellow";
  ctx.stroke();

  ctx.beginPath();
  //   x、y，长短半轴长，旋转角度，开始结束角度
  ctx.ellipse(13, 30, 12, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-27, 40, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

function createNote() {
  const texture = new THREE.CanvasTexture(createCanvas());
  const material = new THREE.SpriteMaterial({
    map: texture,
  });
  const note = new THREE.Sprite(material);
  note.scale.set(100, 100);
  return note;
}

// const note = createNote();

const group = new THREE.Group();

// 随机生成100个音符，nosie噪声库调整位置，tween做缓动动画
for (let i = 0; i < 100; i++) {
  const note = createNote();

  const x = -1000 + 2000 * Math.random();
  const y = -1000 + 2000 * Math.random();
  const z = -2000 + 4000 * Math.random();
  note.position.set(x, y, z);

  group.add(note);
}

const simplex = new SimplexNoise();
const tweenGroup = new Group();

let time = 0;
function updatePosition() {
  group.children.forEach((sprite) => {
    const { x, y, z } = sprite.position;
    const x2 = x + simplex.noise(x, time) * 100;
    const y2 = y + simplex.noise(y, time) * 100;
    const z2 = z + simplex.noise(z, time) * 100;

    // sprite.position.set(x2, y2, z2);
    const tween = new Tween(sprite.position, 0.5, {
      x: x2,
      y: y2,
      z: z2,
    })
      .easing(Easing.Quadratic.InOut)
      .start()
      .repeat(0)
      .onComplete(() => {
        tweenGroup.remove(tween);
      });
    tweenGroup.add(tween);
  });
  time++;
}

const updatePosition2 = throttle(updatePosition,500)

function render() {
  tweenGroup.update();
  updatePosition2();
  requestAnimationFrame(render);
}
render();

export default group;
