import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import stage from "./stage.js";
// import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import {
  EffectComposer,
  RenderPass,
  GlitchPass,
  ShaderPass,
  GammaCorrectionShader,
  OutlinePass,
} from "three/addons/Addons.js";
import { Tween, Easing, Group } from "three/examples/jsm/libs/tween.module.js";
import { CSS2DRenderer } from "three/examples/jsm/Addons";

const scene = new THREE.Scene();

scene.add(stage);

const directionLight = new THREE.DirectionalLight(0xffffff, 2);
directionLight.position.set(500, 400, 300);
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const spotLight = new THREE.SpotLight("white", 5000000);
spotLight.angle = Math.PI / 6;
spotLight.position.set(0, 800, 0);
spotLight.lookAt(0, 0, 0);
spotLight.castShadow = true;
spotLight.shadow.camera.far = 1000;
scene.add(spotLight);

const cameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(cameraHelper);

const width = window.innerWidth;
const height = window.innerHeight;

const helper = new THREE.AxesHelper(500);
// scene.add(helper);

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
camera.position.set(500, 600, 800);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
// 开启阴影设置
renderer.shadowMap.enabled = true;

// 添加后期效果
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 闪屏效果，此时会导致颜色变暗，使用伽马矫正
const glitchPass = new GlitchPass();
// composer.addPass(glitchPass);

// const gammaPass = new ShaderPass(GammaCorrectionShader);
// composer.addPass(gammaPass);

// 加一个描边的后期通道
const v = new THREE.Vector2(window.innerWidth, window.innerWidth);
const outlinePass = new OutlinePass(v, scene, camera);
outlinePass.edgeStrength = 10;
outlinePass.edgeThickness = 10;
outlinePass.pulsePeriod = 1;
composer.addPass(outlinePass);

// 添加CSS2DRenderer渲染器
const css2Renderer = new CSS2DRenderer();
css2Renderer.setSize(width, height);

const tweenGroup = new Group();
function render() {
  css2Renderer.render(scene,camera)
  // renderer.render(scene, camera);
  composer.render();
  tweenGroup.update();
  // tweenGroup.getAll().map(item => item.update(time))
  requestAnimationFrame(render);
}

render();

// 创建一个包含两个render的dom
// document.body.append(renderer.domElement);
const div = document.createElement('div');
div.style.position = 'relative';
div.appendChild(css2Renderer.domElement);
css2Renderer.domElement.style.position = 'absolute';
css2Renderer.domElement.style.left = '0px';
css2Renderer.domElement.style.top = '0px';
css2Renderer.domElement.style.pointerEvents = 'none';
div.appendChild(renderer.domElement);
document.body.appendChild(div);

const controls = new OrbitControls(camera, renderer.domElement);

window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

// 点击时增加描边
renderer.domElement.addEventListener("click", (e) => {
  // 计算屏幕坐标
  const x = (e.clientX / width) * 2 - 1;
  const y = -((e.clientY / width) * 2 - 1);

  // 发出射线
  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

  // 添加描边
  // 去重，et 去重，因为可能点中一个人身体的多个部位，只保留一个 dancer。
  // 而且可能从某个方向能同时点中两个人，这种只保留一个数组元素
  const set = new Set();
  const intersections = rayCaster.intersectObjects(stage.children);
  intersections.forEach((item) => {
    if (item.object.target) {
      console.log(item.object.target);
      set.add(item.object.target);
    }
  });

  const dancerArr = [...set].slice(0, 1);
  outlinePass.selectedObjects = set.size ? dancerArr : [];

  // 点击某个人的时候，我们改一下相机位置，把她放到中央
  if (dancerArr.length) {
    const isDancer1 = dancerArr[0].name === "dancer1";
    // if (isDancer1) {
    //   camera.position.set(24, 955, -580);
    //   camera.lookAt(0, 0, 0);
    // } else {
    //   camera.position.set(42, 1008, 479);
    //   camera.lookAt(0, 0, 0);
    // }
    // 添加镜头变化动画
    const tween = new Tween(camera.position)
      .to(
        isDancer1
          ? {
              x: 24,
              y: 955,
              z: -580,
            }
          : {
              x: 42,
              y: 1008,
              z: 479,
            }
      )
      .easing(Easing.Quadratic.InOut)
      .onUpdate((obj) => {
        camera.position.copy(new THREE.Vector3(obj.x, obj.y, obj.z));
        camera.lookAt(0, 0, 0);
      })
      .start();

    tweenGroup.add(tween);
  }
});

// 添加音乐
const listener = new THREE.AudioListener();
const audio = new THREE.Audio(listener);
const loader = new THREE.AudioLoader();
loader.load("./superman.mp3", (buffer) => {
  audio.setBuffer(buffer);
});

document.body.addEventListener("click", () => {
  if (!audio.isPlaying) {
    audio.setLoop(true);
    audio.setVolume(1);
    audio.play();
  }
});
