import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function init3D(dom: HTMLElement, wallsVisibilityCalc: () => void) {
  const scene = new THREE.Scene();

  // 坐标轴辅助线
  const axesHelper = new THREE.AxesHelper(10000);
  scene.add(axesHelper);

  // 网格辅助线
  // 参数: (网格大小, 划分份数, 中心线颜色, 网格线颜色)
  const gridHelper = new THREE.GridHelper(100000, 500, "white", "white");
  gridHelper.position.y = -100;
  scene.add(gridHelper);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 1500, 0);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambientLight);

  const width = window.innerWidth;
  const height = window.innerHeight - 60;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
  camera.position.set(8000, 8000, 5000);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setClearColor("lightblue");

  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);

    wallsVisibilityCalc();
  }

  render();

  dom.append(renderer.domElement);

  window.onresize = function () {
    const width = window.innerWidth;
    const height = window.innerHeight - 60;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const controls = new OrbitControls(camera, renderer.domElement);

  // 用 edges 数组保存所有的线框，用于后续清除
  const edges: Array<THREE.Line> = [];
  renderer.domElement.addEventListener("click", (e) => {
    // 将点击坐标从像素转换为 NDC（归一化设备坐标 [-1, 1]）
    const y = -((e.offsetY / height) * 2 - 1);
    const x = (e.offsetX / width) * 2 - 1;

    // 从相机位置发出一条射线，穿过点击点
    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // 检测射线与场景中所有对象的交点
    const intersections = rayCaster.intersectObjects(scene.children);

    // 先清除上一次点击的蓝色线框
    edges.forEach((item) => {
      item.parent?.remove(item);
    });
    if (intersections.length) {
      const obj = intersections[0].object as THREE.Mesh;
      if (obj.isMesh) {
        // 提取被点击 Mesh 的棱边（硬边），生成线框几何体，每条棱边 2 个顶点
        const geometry = new THREE.EdgesGeometry(obj.geometry);
        const material = new THREE.LineBasicMaterial({
          color: "blue",
        });
        // 每两个顶点画一条独立的线段，所以这里不用Line，用LineSegments
        const line = new THREE.LineSegments(geometry, material);
        // 将蓝色线框添加到被点击的对象上，线框会跟随对象移动/旋转
        obj.add(line);
        edges.push(line);
      }
    }
  });

  return {
    scene,
    camera,
  };
}
