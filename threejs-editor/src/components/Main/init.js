import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshTypes, useThreeStore } from "../../store";
import {
  EffectComposer,
  GammaCorrectionShader,
  OutlinePass,
  RenderPass,
  ShaderPass,
  TransformControls,
} from "three/examples/jsm/Addons.js";

export function init(dom, data, onSelected, updateMeshInfo) {
  const scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(500);
  scene.add(axesHelper);

  const gridHeper = new THREE.GridHelper(1000);
  scene.add(gridHeper);

  // 3d 场景初始化的时候根据传入的 data 来渲染
  // data.meshArr.forEach((item) => {
  //   if (item.type === MeshTypes.Box) {
  //     const {
  //       width,
  //       height,
  //       depth,
  //       material: { color },
  //     } = item.props;
  //     const geometry = new THREE.BoxGeometry(width, height, depth);
  //     const material = new THREE.MeshPhongMaterial({
  //       color,
  //     });
  //     const mesh = new THREE.Mesh(geometry, material);
  //     scene.add(mesh);
  //   }
  // });

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(500, 400, 300);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const width = dom.clientWidth;
  const height = dom.clientHeight;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.set(500, 500, 500);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);

  // 点击场景中的 mesh 时，将其颜色设置为绿色
  renderer.domElement.addEventListener("click", (e) => {
    const y = -((e.offsetY / height) * 2 - 1);
    const x = (e.offsetX / width) * 2 - 1;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // 只有 Box、Cylinder 开头的物体可以点击，其余的物体比如 GridHelper 之类的不处理点击事件
    const objs = scene.children.filter((item) => {
      return item.name.startsWith("Box") || item.name.startsWith("Cylinder");
    });
    const intersections = rayCaster.intersectObjects(objs);

    if (intersections.length) {
      const obj = intersections[0].object;
      //   obj.material.color.set('green');
      outlinePass.selectedObjects = [obj];
      onSelected(obj);
      transformControls.attach(obj);
    } else {
      outlinePass.selectedObjects = [];
      onSelected(null);
      transformControls.detach();
    }
  });

  // 创建效果合成器 EffectComposer，然后添加两个后期通道 RenderPass、OutlinePass。
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const v = new THREE.Vector2(window.innerWidth, window.innerHeight);
  // OutlinePass 设置闪烁周期是 1s
  const outlinePass = new OutlinePass(v, scene, camera);
  outlinePass.pulsePeriod = 1;
  composer.addPass(outlinePass);

  // 场景变暗了
  // 这个是加了后期通道后的常见问题，加一下伽马校正就好了
  const gammaPass = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gammaPass);

  // 轨道控制器
  const orbitControls = new OrbitControls(camera, renderer.domElement);

  // 变换控制器
  const transformControls = new TransformControls(camera, renderer.domElement);
  const transformHelper = transformControls.getHelper();
  scene.add(transformHelper);
  // 变换后统一用 objectChange + rAF 批量更新 store
  // - 必须用 "objectChange" 而非 "change" 事件
  //   "change" 会在任何属性变化时触发（包括 hover 切换 axis），导致不必要更新
  // - 必须使用 rAF 批处理：将 store 更新推送到下一帧执行
  //   避免在 THREE.js 事件循环中同步调用 React setState，防止无限嵌套更新
  // - 三个属性（position/scale/rotation）统一处理，不再需要单独的 change 事件监听
  let pendingUpdate = null;
  let pendingName = null;
  let rafId = null;
  transformControls.addEventListener("objectChange", () => {
    const obj = transformControls.object;
    if (!obj) return;

    if (!pendingUpdate) {
      pendingUpdate = {};
      pendingName = obj.name;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const u = pendingUpdate;
        const n = pendingName;
        pendingUpdate = null;
        pendingName = null;
        if (u.pos !== undefined) updateMeshInfo(n, u.pos, "position");
        if (u.scale !== undefined) updateMeshInfo(n, u.scale, "scale");
        if (u.rot !== undefined) updateMeshInfo(n, u.rot, "rotation");
      });
    }
    // 持续更新最新的位置/缩放/旋转
    pendingUpdate.pos = {
      x: obj.position.x,
      y: obj.position.y,
      z: obj.position.z,
    };
    pendingUpdate.scale = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };
    pendingUpdate.rot = {
      x: obj.rotation.x,
      y: obj.rotation.y,
      z: obj.rotation.z,
    };
  });
  // 变换控制器拖动时，轨道控制器禁用
  transformControls.addEventListener("dragging-changed", function (event) {
    orbitControls.enabled = !event.value;
  });

  function render(time) {
    composer.render();
    // renderer.render(scene, camera);
    transformControls.update(time);
    requestAnimationFrame(render);
  }
  render();
  dom.append(renderer.domElement);

  window.onresize = function () {
    const width = dom.clientWidth;
    const height = dom.clientHeight;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  // 设置变换控制器模式
  function setTransformControlsMode(mode) {
    transformControls.setMode(mode);
  }

  // 为变换控制器绑定物体，点击右侧树状结构中的物体时，绑定到变换控制器上
  function transformControlsAttachObj(obj) {
    transformControls.attach(obj);
  }

  return {
    scene,
    transformControls,
    setTransformControlsMode,
    transformControlsAttachObj,
  };
}
