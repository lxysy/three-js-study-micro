import * as THREE from "three";
import { Tween } from "@tweenjs/tween.js";

const group = new THREE.Group();

// 创建一个立方体纹理加载器
const textureCube = new THREE.CubeTextureLoader()
  .setPath("./city/")
  .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

// 参数 256 是 size，也就是 128 * 128 像素，一般设置 2 的多少次方，比如 32、64、128、256、512、1024 这种
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
// 一个能"看到 360° 全景"的相机
// 普通的 PerspectiveCamera 只拍一个方向，而 CubeCamera 一次性向 6 个方向（前后左右上下）各拍一张，拼成一个立方体贴图
export const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

const geometry = new THREE.PlaneGeometry(1000, 1000);
const material = new THREE.MeshStandardMaterial({
  color: "white",
  metalness: 1,
  roughness: 0,
  // 拍完后，这个立方体贴图被赋给了镜子的 envMap
  // 效果：镜子能实时反射周围环境，连动态移动的小球也能正确反射出来。
  envMap: cubeRenderTarget.texture,
});
const mesh = new THREE.Mesh(geometry, material);
group.add(mesh);

const geometry2 = new THREE.SphereGeometry(100);
const material2 = new THREE.MeshStandardMaterial({
  color: "lightgreen",
});
const mesh2 = new THREE.Mesh(geometry2, material2);
mesh2.position.set(0, 0, 500);
group.add(mesh2);

// 小球绕大平面做半圆往复运动。
// angle 从 0 到 Math.PI（180°）变化，持续 5 秒
let r = 800;
export const ballTween = new Tween({ angle: 0 })
  .to(
    {
      angle: Math.PI,
    },
    5000,
  )
  .repeat(Infinity)
  .onUpdate((obj) => {
    // angle 从 0 到 Math.PI，然后算出 cos、sin 作为 x、z，五秒一次，一直重复
    mesh2.position.x = Math.cos(obj.angle) * r;
    mesh2.position.z = Math.sin(obj.angle) * r;
  })
  .start();

export default group;
