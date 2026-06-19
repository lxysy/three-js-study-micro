import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DecalGeometry } from "three/examples/jsm/Addons.js";
import mesh from "./mesh";
import gsap from "gsap";

export function init(dom) {
  const scene = new THREE.Scene();
  scene.add(mesh);

  const axesHelper = new THREE.AxesHelper(500);
  scene.add(axesHelper);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(500, 400, 300);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.set(0, 500, 500);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);

  function render(time) {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  dom.append(renderer.domElement);

  window.onresize = function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  // 加载纹理
  const loader = new THREE.TextureLoader();
  // const texture = loader.load("./heart.png");
  // texture.colorSpace = THREE.SRGBColorSpace;

  let texture = null;

  // 点击事件
  renderer.domElement.addEventListener("click", (e) => {
    const y = -((e.offsetY / height) * 2 - 1);
    const x = (e.offsetX / width) * 2 - 1;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersections = rayCaster.intersectObjects(mesh.children);

    if (intersections.length) {
      const position = intersections[0].point;

      if (!texture) {
        return;
      }

      const orientation = new THREE.Euler();
      const size = new THREE.Vector3(100, 100, 100);
      const geometry = new DecalGeometry(
        intersections[0].object,
        position,
        orientation,
        size,
      );
      const material = new THREE.MeshPhongMaterial({
        polygonOffset: true,
        polygonOffsetFactor: -10,
        map: texture,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    }
  });

  const controls = new OrbitControls(camera, renderer.domElement);

  function changeTShirtColor(color) {
    const tshirt = scene.getObjectByName("tshirt");
    if (tshirt) {
      tshirt.material.color.set(color);
    }
  }

  // 切换纹理
  function changeTexture(url) {
    texture = loader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 保存当前画面为图片
  function downloadImg() {
    // 先手动渲染一帧，确保画布是最新画面
    renderer.render(scene, camera);

    // toBlob: 把 canvas 的内容转为指定格式的二进制数据（Blob）
    renderer.domElement.toBlob((blob) => {
      if (blob) {
        // 利用 <a> 标签模拟点击，触发浏览器下载
        downloadBlob(blob, "design.png");
      }
    }, "image/png");
  }

  // 录制 3 秒画面并保存为视频
  function downloadVideo() {
    // captureStream(60): 捕获 canvas 的实时画面流，60 帧/秒
    const stream = renderer.domElement.captureStream(60);

    // MediaRecorder: 将视频流编码为指定格式（默认 webm）
    // MediaRecorder 支持的格式取决于浏览器本身 .isTypeSupported("video/mp4") 返回 true 表示支持 mp4 格式
    // 格式参考WebAssembly 视频编码格式 npm install ffmpeg.wasm
    const recorder = new MediaRecorder(stream);
    recorder.start();

    // ondataavailable: 当录制产生数据块时触发
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        // 把录好的数据块下载为 webm 视频文件
        downloadBlob(event.data, `design.webm`);
      }
    };

    // 3 秒后停止录制，触发 ondataavailable 输出最终数据
    // setTimeout(() => {
    //   recorder.stop();
    // }, 3000);

    // 时间线动画：旋转场景，3 秒后停止录制 gsap
    gsap.to(scene.rotation, {
      y: Math.PI * 2,
      duration: 3,
      onComplete() {
        // scene.rotation.y 设置为 0，这样下次才能再转
        scene.rotation.y = 0;
        recorder.stop();
      },
    });
  }

  return {
    scene,
    renderer,
    controls,
    changeTShirtColor,
    changeTexture,
    downloadImg,
    downloadVideo,
  };
}
