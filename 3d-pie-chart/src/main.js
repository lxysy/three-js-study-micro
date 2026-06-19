import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh.js";
import { Tween, Group, Easing } from "three/examples/jsm/libs/tween.module.js";

const scene = new THREE.Scene();
scene.add(mesh);

const directionLight = new THREE.DirectionalLight(0xffffff, 2);
directionLight.position.set(500, 400, 300);
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const helper = new THREE.AxesHelper(1000);
scene.add(helper);

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
camera.position.set(500, 600, 800);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

const tweenGroup = new Group();
function render() {
  tweenGroup.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// 点击事件处理
renderer.domElement.addEventListener("click", (e) => {
  // 计算屏幕坐标
  const x = (e.offsetX / width) * 2 - 1;
  const y = -((e.offsetY / height) * 2 - 1);

  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

  const intersections = rayCaster.intersectObjects(mesh.children);

  if (intersections.length) {
    const obj = intersections[0].object?.target;

    // mesh虽然旋转了，几何体的顶点数据（如位置、法线等）存储在geometry对象中，这些数据在初始化后通常是固定的，不会因为mesh的旋转而改变
    // mesh的旋转、缩放和平移等变换是通过矩阵运算来实现的。具体来说，mesh有一个matrix属性，它存储了所有这些变换的组合结果
    // 当mesh旋转时，Three.js会根据旋转的角度和轴更新matrix，然后在渲染时使用这个矩阵来变换几何体的顶点位置，使其看起来像是旋转了
    // 所以我们这里使用旋转前的点数据来计算 根据mesh上记录的中间角度，让向外拉出去
    mesh.traverse((obj) => {
      // 区分sprite，重置时不移动标签位置
      if (obj.isSprite) return;
      obj.position.x = 0;
      obj.position.y = 0;

      // 复原的动画
      const tween = new Tween(obj.position)
        .to({
          x: 0,
          y: 0,
        })
        .easing(Easing.Quadratic.InOut)
        .repeat(0)
        .onComplete(() => {
          tweenGroup.remove(tween);
        })
        .start();
      tweenGroup.add(tween);
    });
    // obj.position.x = 100 * Math.cos(obj.angle);
    // obj.position.y = 100 * Math.sin(obj.angle);

    // 拉出扇形的动画,应为obj.angle只在上有，所以这里如果点击sprite拿不到obj.angle会导致sprite消失
    // 解决方法就是只对mesh的position做操作
    const tween = new Tween(obj.position)
      .to({
        x: 100 * Math.cos(obj.angle),
        y: 100 * Math.sin(obj.angle),
      })
      .easing(Easing.Quadratic.InOut)
      .repeat(0)
      .onComplete(() => {
        tweenGroup.remove(tween);
      })
      .start();
    tweenGroup.add(tween);
  }
});
