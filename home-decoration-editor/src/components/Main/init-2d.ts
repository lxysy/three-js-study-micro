import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MapControls, TransformControls } from "three/examples/jsm/Addons.js";
import type { Action } from "../../store";

export function init2D(
  dom: HTMLElement,
  updateFurniture: Action["updateFurniture"],
  onSelectFurniture?: (id: string | null) => void,
) {
  const scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(10000);
  scene.add(axesHelper);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 1500, 0);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  const width = window.innerWidth;
  const height = window.innerHeight - 60;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
  camera.position.set(0, 10000, 0);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setClearColor("lightblue");

  // 修改相机位置到俯视角
  // 改了 camera 的 lookAt 要同时修改 OrbitControls 的 target 才可以，不然会被重置到 0,0,0
  // camera.position.set(200, 500, -100);
  // camera.lookAt(200, 0, -100);

  // 添加地图控制器
  const controls = new MapControls(camera, renderer.domElement);
  // 禁用旋转
  controls.enableRotate = false;
  // controls.target.set(0, 0, 0);
  controls.addEventListener("change", () => {
    // console.log(controls.target, camera.position);
  });

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  dom.append(renderer.domElement);

  window.onresize = function () {
    const size = renderer.getSize(new THREE.Vector2());

    if (size.y === 200) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight - 60;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.showY = false;

  const transformHelper = transformControls.getHelper();
  scene.add(transformHelper);

  transformControls.addEventListener("dragging-changed", function (event) {
    controls.enabled = !event.value;
    if (!event.value) {
      // 拖拽结束，将最终位置同步到 Zustand store
      const obj = transformControls.object;
      if (obj) {
        if (transformControls.mode === "translate") {
          updateFurniture(
            obj.name,
            "position",
            new THREE.Vector3(
              -obj.position.x,
              -obj.position.y,
              -obj.position.z,
            ),
          );
        } else if (transformControls.mode === "rotate") {
          updateFurniture(
            obj.name,
            "rotation",
            new THREE.Vector3(obj.rotation.x, obj.rotation.y, obj.rotation.z),
          );
        }
      }
    }
  });

  // 用 edges 数组保存所有的线框，用于后续清除
  const edges: Array<THREE.Line> = [];
  renderer.domElement.addEventListener("click", (e) => {
    // width、height 改成动态取的 canvas 宽高
    // 这里是为了右上角小视图也能正常操作
    const { x: width, y: height } = renderer.getSize(new THREE.Vector2());

    // 将点击坐标从像素转换为 NDC（归一化设备坐标 [-1, 1]）
    const y = -((e.offsetY / height) * 2 - 1);
    const x = (e.offsetX / width) * 2 - 1;

    // 从相机位置发出一条射线，穿过点击点
    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // 检测射线与场景中所有对象的交点
    const intersections = rayCaster.intersectObjects(scene.children, true);

    const furnitures = scene.getObjectByName("furnitures")!;
    const intersections2 = rayCaster.intersectObjects(furnitures.children);

    if (intersections2.length) {
      const obj = intersections2[0].object as any;
      if (obj.target) {
        transformControls.attach(obj.target);
        onSelectFurniture?.(obj.target.name);
      }
    } else {
      transformControls.detach();
      onSelectFurniture?.(null);
    }

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
        console.log(obj);
      }
    }
  });

  function changeMode(isTranslate: boolean) {
    if (isTranslate) {
      transformControls.mode = "translate";
      transformControls.showX = true;
      transformControls.showZ = true;
      transformControls.showY = false;
    } else {
      transformControls.mode = "rotate";
      transformControls.showX = false;
      transformControls.showZ = false;
      transformControls.showY = true;
    }
  }

  function changeSize(isBig: boolean) {
    if (isBig) {
      const width = window.innerWidth;
      const height = window.innerHeight - 60;

      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    } else {
      const width = 240;
      const height = 200;

      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  return {
    scene,
    renderer,
    camera,
    changeMode,
    changeSize,
    detachControls: () => transformControls.detach(),
  };
}
