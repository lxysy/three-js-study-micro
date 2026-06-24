import { useCallback, useEffect, useRef, useState } from "react";
import { init3D } from "./init-3d.ts";
import { init2D } from "./init-2d.ts";
import { Button } from "antd";
import * as THREE from "three";
import { useHouseStore, type State } from "../../store/index.ts";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import SpriteText from "three-spritetext";
import { useDrop } from "react-dnd";
import { getFurnitureConfig } from "../../store/furnitureConfig.ts";
import { modelMap } from "../../modelMap.ts";

let loaderCache: GLTFLoader;
// 统一加载所有模型，途中使用loading，加载完成才展示场景
export function getGLTFLoader() { 
  if (!loaderCache) {
    const gltfLoader = new GLTFLoader();
    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath(
    //   "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
    // );
    // gltfLoader.setDRACOLoader(dracoLoader);
    loaderCache = gltfLoader;
  }
  return loaderCache;
}

// 我们用一个全局变量来存储窗户模型，这样全局只加载一次
// 这里切换户型时模型被卸载了，这里不缓存，重新加载
// let winModel: { model: THREE.Group; size: THREE.Vector3 } | null = null;
async function loadWindow() {
  // if (winModel !== null) {
  //   return winModel;
  // } else {
  const group = new THREE.Group();
  const gltf = await modelMap['./window.glb'];
  gltf.scene = gltf.scene.clone();
  group.add(gltf.scene);

  // 加载 GLTF 模型后，你不知道它到底有多大。用 Box3 算一下模型的实际尺寸
  // 创建一个空的轴向包围盒（Axis-Aligned Bounding Box
  const box = new THREE.Box3();
  // 遍历模型的所有几何体，计算出能包住整个模型的最小立方体
  box.expandByObject(gltf.scene);

  // 获取这个包围盒的尺寸 (width, height, depth)
  const size = box.getSize(new THREE.Vector3());
  // console.log("size", size);
  // winModel = {
  //   model: group,
  //   size,
  // };
  // return winModel;
  // }

  return {
    model: group,
    size,
  };
}
// 我们用一个全局变量来存储门模型，这样全局只加载一次
// let doorModel: { model: THREE.Group; size: THREE.Vector3 } | null = null;
async function loadDoor() {
  // if (doorModel !== null) {
  //   return doorModel;
  // } else {
  const group = new THREE.Group();
  const gltf = await modelMap['./door.glb'];
  gltf.scene = gltf.scene.clone();
  group.add(gltf.scene);

  const box = new THREE.Box3();
  box.expandByObject(gltf.scene);

  const size = box.getSize(new THREE.Vector3());
  //   // console.log('size', size)
  //   doorModel = {
  //     model: group,
  //     size,
  //   };
  //   return doorModel;
  // }

  return {
    model: group,
    size,
  };
}

// 加载地板纹理
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load("./floor-texture.png");
floorTexture.colorSpace = THREE.SRGBColorSpace;
// 设置纹理在 S（水平/U方向）和 T（垂直/V方向）上重复平铺
// 当 UV 坐标超出 [0,1] 范围时，纹理不会拉伸而是重复拼接
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
// 因为 ShapeGeometry、ExtrudeGeometry 这种画出来的几何体的 uv 值都特别大，所以要设置一个比较小的 repeat 才能正常展示出纹理。
//     默认 repeat 为 (1, 1)，纹理采样时 UV 每增加 1 就重复一次
// 800 的范围 → 纹理在 U 和 V 方向上各重复 800 次
// 结果：整个地板看起来密密麻麻全是缩微的小纹理，完全看不出图案
// repeat = 0.002 → 每 1 个单位 UV 只显示 0.002 倍的纹理
//             → 800 个单位 UV 显示 800 × 0.002 = 1.6 遍纹理
floorTexture.repeat.set(0.002, 0.002);

function Main() {
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const renderer2DRef = useRef<THREE.WebGLRenderer>(null);
  const scene3DRef = useRef<THREE.Scene>(null);
  const scene2DRef = useRef<THREE.Scene>(null);
  const camera3DRef = useRef<THREE.Camera>(null);
  const camera2DRef = useRef<THREE.Camera>(null);
  const changeModeRef = useRef<(isTranslate: boolean) => void>(null);
  const changeMode2DRef = useRef<(isTranslate: boolean) => void>(null);
  const changeSize3DRef = useRef<(isBig: boolean) => void>(null);
  const changeSize2DRef = useRef<(isBig: boolean) => void>(null);
  const detachControls3DRef = useRef<() => void>(null);
  const detachControls2DRef = useRef<() => void>(null);

  const { data, dataVersion, updateFurniture, addFurniture, removeFurniture } =
    useHouseStore();

  const dataRef = useRef<State["data"]>(null);
  dataRef.current = data;

  // 跟踪正在异步加载的家具 ID（3D 和 2D 各一个 set），防止重复创建
  const loading3D = useRef(new Set<string>());
  const loading2D = useRef(new Set<string>());

  // 切换按钮
  const [curMode, setCurMode] = useState("2d");
  // 当前选中的家具 id（用于 Delete 删除）
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 计算墙的可见性 相机和墙的方向向量的点积大于0时（锐角），墙不可见
  function wallsVisibilityCalc() {
    const camera = camera3DRef.current!;
    const scene = scene3DRef.current;

    if (!camera) {
      return;
    }
    // data.walls.forEach 这个函数引用的 data 是第一次的，形成了闭包，所以后面切换了户型用的也是之前的 data
    dataRef.current!.walls.forEach((item, index) => {
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const wallDirection = new THREE.Vector3(
        item.normal.x,
        item.normal.y,
        item.normal.z,
      );

      const obj = scene?.getObjectByName("wall" + index)!;

      if (wallDirection.dot(cameraDirection) > 0) {
        obj.visible = false;
      } else {
        obj.visible = true;
      }
    });
  }

  useEffect(() => {
    const dom = document.getElementById("threejs-3d-container")!;
    const { renderer, scene, camera, changeMode, changeSize, detachControls } =
      init3D(dom, wallsVisibilityCalc, updateFurniture, (id) => {
        setSelectedId(id);
      });

    rendererRef.current = renderer;
    scene3DRef.current = scene;
    camera3DRef.current = camera;
    changeModeRef.current = changeMode;
    changeSize3DRef.current = changeSize;
    detachControls3DRef.current = detachControls;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  // 初始化3D场景时，设置右上角小窗口默认大小
  useEffect(() => {
    const changeSize3D = changeSize3DRef.current!;

    changeSize3D(false);
  }, []);

  useEffect(() => {
    const dom = document.getElementById("threejs-2d-container")!;
    const { scene, renderer, camera, changeMode, changeSize, detachControls } =
      init2D(dom, updateFurniture, (id) => {
        setSelectedId(id);
      });
    renderer2DRef.current = renderer;
    camera2DRef.current = camera;
    changeMode2DRef.current = changeMode;
    changeSize2DRef.current = changeSize;
    detachControls2DRef.current = detachControls;

    scene2DRef.current = scene;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  // dataVersion 变化时（户型切换）清理旧场景：移除旧的 house 对象并释放 GPU 内存
  useEffect(() => {
    const scene1 = scene2DRef.current; // 2D 俯视图场景
    const scene2 = scene3DRef.current; // 3D 透视场景
    const house1 = scene1?.getObjectByName("house"); // 旧的 2D 房子
    const house2 = scene2?.getObjectByName("house"); // 旧的 3D 房子

    // 场景移除
    house1?.parent?.remove(house1);
    house2?.parent?.remove(house2);

    // 遍历释放两个场景的几何体 GPU 资源，防止内存泄漏
    house1?.traverse((item) => {
      const obj = item as THREE.Mesh;
      if (obj.isMesh) {
        obj.geometry.dispose();
      }
    });
  }, [dataVersion]);

  // 根据仓库中的数据绘制3D场景（仅在 dataVersion 变化时全量重建）
  useEffect(() => {
    console.log("绘制3D场景effect------------");
    const house = new THREE.Group();
    const scene = scene3DRef.current!;

    // 更新家具位置和旋转 其他数据不变
    const houseObj = scene.getObjectByName("house")!;
    if (houseObj) {
      data.furnitures.forEach((furniture) => {
        const obj = houseObj.getObjectByName(furniture.id);

        if (obj) {
          obj.position.set(
            furniture.position.x,
            furniture.position.y,
            furniture.position.z,
          );

          obj.rotation.x = furniture.rotation.x;
          obj.rotation.y = furniture.rotation.y;
          obj.rotation.z = furniture.rotation.z;
        }
      });
      return;
    }
    console.log("data.furnitures", houseObj, data.furnitures);

    // 绘制墙 画出shape，然后再拉伸shape
    const walls = data.walls.map((item, index) => {
      // THREE.Shape 始终是在 XY 平面上的
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, item.height);
      shape.lineTo(item.width, item.height);
      shape.lineTo(item.width, 0);
      shape.lineTo(0, 0);

      // 挖孔绘制窗户 同样在xy平面上
      // shape内部只有xy
      item.windows.forEach(async (win) => {
        const path = new THREE.Path();

        const { left, bottom } = win.leftBottomPosition;

        path.moveTo(left, bottom);
        path.lineTo(left + win.width, bottom);
        path.lineTo(left + win.width, bottom + win.height);
        path.lineTo(left, bottom + win.height);
        path.lineTo(left, bottom);
        shape.holes.push(path);

        // 加载窗户模型并缩放
        const { model, size } = await loadWindow();
        // 窗户模型的中心位置在shape的中心位置
        model.position.x = win.width / 2 + win.leftBottomPosition.left;
        model.position.y = win.height / 2 + win.leftBottomPosition.bottom;
        // model.position.y = item.height / 2;
        // model.position.z = item.position.z;
        console.log("model.position", model.position);
        // 将模型从原始尺寸缩放到窗户孔洞的大小
        // size.x/size.y 是 GLTF 模型的原始宽高，win.width/win.height 是墙上孔洞的目标宽高
        // 两者相除得到缩放比例，让模型刚好填满窗户孔
        // Z 方向保持 1，因为窗户厚度不需要改变
        model.scale.set(win.width / size.x, win.height / size.y, 1);

        // 将窗户模型添加到墙模型中，方便后续旋转
        // 且此时窗户的position是相对于wall局部坐标原点的偏移量，不再是世界坐标。
        // wall的局部原点就是shape开始的点
        wall.add(model);
      });

      // 挖孔绘制门 同样在xy平面上
      item.doors?.forEach(async (door) => {
        const path = new THREE.Path();

        const { left, bottom } = door.leftBottomPosition;

        path.moveTo(left, bottom);
        path.lineTo(left + door.width, bottom);
        path.lineTo(left + door.width, bottom + door.height);
        path.lineTo(left, bottom + door.height);
        path.lineTo(left, bottom);
        shape.holes.push(path);

        const { model, size } = await loadDoor();
        model.rotateY(Math.PI / 2);
        model.position.x = door.width / 2 + door.leftBottomPosition.left;
        model.position.y = door.height / 2 + door.leftBottomPosition.bottom;
        model.scale.set(1, door.height / size.y, door.width / size.z);

        wall.add(model);
      });

      // 朝 Z 轴拉伸
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: item.depth,
      });
      const material = new THREE.MeshPhongMaterial({
        color: "white",
      });
      const wall = new THREE.Mesh(geometry, material);
      // wall.rotateX(-Math.PI/2);
      // 把墙的左下前角（局部原点，因为shape是从0,0开始）放到世界坐标的 (px, py, pz) 位置
      wall.position.set(item.position.x, item.position.y, item.position.z);

      if (item.rotationY) {
        wall.rotation.y = item.rotationY;
      }

      wall.name = "wall" + index;

      return wall;
    });

    // scene.add(...walls);
    house.add(...walls);

    // 绘制地板
    const floorGroup = new THREE.Group();
    floorGroup.name = "floors";
    const floors = data.floors.map((item) => {
      const shape = new THREE.Shape();
      shape.moveTo(item.points[0].x, item.points[0].z);
      for (let i = 1; i < item.points.length; i++) {
        shape.lineTo(item.points[i].x, item.points[i].z);
      }

      let texture = floorTexture;
      if (item.textureUrl) {
        texture = textureLoader.load(item.textureUrl);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.002, 0.002);
      }

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        // color: "orange",
        map: texture,
        side: THREE.DoubleSide,
      });
      console.log("geometry", geometry);
      const floor = new THREE.Mesh(geometry, material);
      floor.position.y = 0;
      floor.position.z = 200;
      floor.rotateX(Math.PI / 2);

      floorGroup.add(floor);
      return floor;
    });
    // scene.add(...floors);
    house.add(floorGroup);

    // 绘制天花板
    const ceilings = data.ceilings.map((item) => {
      const shape = new THREE.Shape();
      shape.moveTo(item.points[0].x, item.points[0].z);
      for (let i = 1; i < item.points.length; i++) {
        shape.lineTo(item.points[i].x, item.points[i].z);
      }

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        color: "#eee",
        side: THREE.FrontSide,
      });
      const ceiling = new THREE.Mesh(geometry, material);
      ceiling.rotateX(Math.PI / 2);
      ceiling.position.y = item.height;
      return ceiling;
    });
    // scene.add(...ceilings);
    house.add(...ceilings);

    // 绘制家具（只创建空分组，实际模型由增量 effect 统一加载）
    const furnitures = new THREE.Group();
    furnitures.name = "furnitures";
    house.add(furnitures);

    scene.add(house);

    // 计算包围盒 包围盒中心居中
    const box3 = new THREE.Box3();
    box3.expandByObject(house);

    const center = box3.getCenter(new THREE.Vector3());
    house.position.set(-center.x, 0, -center.z);
    house.name = "house";

    // const gltfLoader = new GLTFLoader();
    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath("draco/");
    // gltfLoader.setDRACOLoader(dracoLoader);

    // gltfLoader.load(
    //   "./bed2.glb",
    //   (gltf) => {
    //     const box = new THREE.Box3().expandByObject(gltf.scene);
    //     const size = box.getSize(new THREE.Vector3());
    //     console.log("原始尺寸", size); // 看看原始大小

    //     scene.add(gltf.scene);
    //     gltf.scene.scale.setScalar(21);
    //   },
    //   (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
    //   (error) => console.error("加载失败", error),
    // );
  }, [dataVersion]);

  // 根据仓库中的数据绘制2D场景（仅在 dataVersion 变化时全量重建）
  useEffect(() => {
    const scene = scene2DRef.current!;
    const house = new THREE.Group();

    const houseObj = scene.getObjectByName("house")!;
    if (houseObj) {
      data.furnitures.forEach((furniture) => {
        const obj = houseObj.getObjectByName(furniture.id);

        if (obj) {
          obj.position.set(
            -furniture.position.x,
            -furniture.position.y,
            -furniture.position.z,
          );
          obj.rotation.x = furniture.rotation.x;
          obj.rotation.y = furniture.rotation.y;
          obj.rotation.z = furniture.rotation.z;
        }
      });
      return;
    }

    // 绘制墙
    const walls = data.walls.map((item, index) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, item.depth);
      shape.lineTo(item.width, item.depth);
      shape.lineTo(item.width, 0);
      shape.lineTo(0, 0);
      // 绘制窗户孔洞
      item.windows?.forEach(async (win) => {
        const path = new THREE.Path();

        const { left } = win.leftBottomPosition;

        path.moveTo(left, 0);
        path.lineTo(left, item.depth);
        path.lineTo(left + win.width, item.depth);
        path.lineTo(left + win.width, 0);
        path.lineTo(left, 0);
        shape.holes.push(path);
      });
      // 绘制门孔洞
      item.doors?.forEach(async (door) => {
        const path = new THREE.Path();

        const { left } = door.leftBottomPosition;

        path.moveTo(left, 0);
        path.lineTo(left, item.depth);
        path.lineTo(left + door.width, item.depth);
        path.lineTo(left + door.width, 0);
        path.lineTo(left, 0);
        shape.holes.push(path);
      });

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        color: "white",
        side: THREE.DoubleSide,
      });
      const wall = new THREE.Mesh(geometry, material);

      // 绘制窗户
      item.windows?.forEach((win) => {
        const { left } = win.leftBottomPosition;
        const geometry = new THREE.PlaneGeometry(win.width, item.depth);
        const material = new THREE.MeshBasicMaterial({
          color: "#aaa",
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });
        // 原点在这个长方形中心
        const winLogo = new THREE.Mesh(geometry, material);
        winLogo.position.x = left + win.width / 2;
        winLogo.position.y = item.depth / 2;
        wall.add(winLogo);
      });

      // 绘制门
      item.doors?.forEach((door) => {
        const { left } = door.leftBottomPosition;

        // 门用扇形表示
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.arc(0, 0, door.width, 0, Math.PI / 2, false);
        shape.lineTo(0, 0);

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: "#aaa",
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
          depthTest: false, // 始终在最前面绘制
          depthWrite: false, //扇形不写深度缓冲，地板不会"捡到"它的深度
        });
        const doorLogo = new THREE.Mesh(geometry, material);
        doorLogo.position.x = left;
        doorLogo.position.y = 200;
        // 因为有旋转，所以这里不能直接改
        // doorLogo.position.z = -100;
        doorLogo.rotateZ(-Math.PI / 2);
        // 条件覆盖 position
        if (door.position) {
          if (door.position.x !== undefined)
            doorLogo.position.x = door.position.x;
          if (door.position.y !== undefined)
            doorLogo.position.y = door.position.y;
          if (door.position.z !== undefined)
            doorLogo.position.z = door.position.z;
        }
        // 条件覆盖 rotation
        if (door.rotation) {
          if (door.rotation.rotateX !== undefined)
            doorLogo.rotateX(door.rotation.rotateX);
          if (door.rotation.rotateY !== undefined)
            doorLogo.rotateY(door.rotation.rotateY);
          if (door.rotation.rotateZ !== undefined)
            doorLogo.rotateZ(door.rotation.rotateZ);
        }
        doorLogo.renderOrder = 999; // 最后渲染
        wall.add(doorLogo);
      });

      // 根据shape的起点位置设置，也就是（0,0,0）
      // matrix = 位移 × 旋转 × 缩放
      // wall.position.set(item.position.x, item.position.y, item.position.z);
      wall.position.set(-item.position.x, -item.position.y, -item.position.z);

      // 绘制墙宽度文字
      const text = new SpriteText(item.width + "", 200);
      text.color = "black";
      wall.add(text);
      text.position.x = item.width / 2;
      text.position.y = 500;
      text.position.z = -100;
      const bufferGeometry = new THREE.BufferGeometry();
      // 同样在xy平面上画，后续和shape一起旋转
      bufferGeometry.setFromPoints([
        new THREE.Vector3(0, -100, 0),
        new THREE.Vector3(0, 100, 0),
        new THREE.Vector3(0, 0, 0),
        // 不让线穿过文字
        new THREE.Vector3(item.width / 2 - 300, 0, 0),
        new THREE.Vector3(item.width / 2 + 300, 0, 0),
        new THREE.Vector3(item.width, 0, 0),
        new THREE.Vector3(item.width, -100, 0),
        new THREE.Vector3(item.width, 100, 0),
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: "#111" });
      // LineSegments 是两两相连，我们中间加两个点。
      const line = new THREE.LineSegments(bufferGeometry, lineMaterial);
      wall.add(line);
      line.position.y = 500;
      line.position.z = -100;
      if (item?.text?.position) {
        if (item.text.position.x !== undefined) {
          line.position.x = item.text.position.x;
          text.position.x = item.text.position.x;
        }
        if (item.text.position.y !== undefined) {
          line.position.y = item.text.position.y;
          text.position.y = item.text.position.y;
        }
        if (item.text.position.z !== undefined) {
          line.position.z = item.text.position.z;
          text.position.z = item.text.position.z;
        }
      }

      if (item.rotationY) {
        wall.rotation.y = item.rotationY;
      }
      wall.name = "wall" + index;
      // 四元数后乘 再顶点变换顺序来说 这里rotateX要先于上面的rotateY
      // v' = (Qy × Qx) × v = Qy × (Qx × v)
      // 旋转变换顺序为 rotateY(Math.PI) -> rotateX(-Math.PI / 2) -> rotation.y
      // 且都是绕自身坐标系旋转，shape默认在xy平面上,然后根据wall.position就可以确认自身原点坐标系
      wall.rotateX(-Math.PI / 2);
      wall.rotateY(Math.PI);

      return wall;
    });

    // 绘制地板
    const floors = data.floors.map((item) => {
      const shape = new THREE.Shape();
      shape.moveTo(item.points[0].x, item.points[0].z);
      for (let i = 1; i < item.points.length; i++) {
        shape.lineTo(item.points[i].x, item.points[i].z);
      }

      let texture = floorTexture;
      if (item.textureUrl) {
        texture = textureLoader.load(item.textureUrl);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.002, 0.002);
      }

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const floor = new THREE.Mesh(geometry, material);

      floor.position.z = -200;

      // 绘制文字 在添加文字后再旋转
      const text = new SpriteText(item.name + "\n" + item.size + "m²", 200);
      text.color = "black";
      const box3 = new THREE.Box3();
      box3.expandByObject(floor);
      const center = box3.getCenter(new THREE.Vector3());
      text.position.set(center.x, center.y, center.z);

      // 绘制地板包围盒
      // const helper = new THREE.Box3Helper(box3);
      // floor.add(helper);
      floor.add(text);

      floor.rotateX(Math.PI / 2);
      floor.rotateZ(Math.PI);

      return floor;
    });

    house.add(...walls);

    // 与 3D 场景一致：地板放入 "floors" 组，便于射线检测统一查找
    const floorGroup = new THREE.Group();
    floorGroup.name = "floors";
    floorGroup.add(...floors);
    house.add(floorGroup);
    scene.add(house);

    // const rad = THREE.MathUtils.degToRad(26);
    house.rotateY(Math.PI / 2);

    // 计算包围盒 包围盒中心居中 坐标轴原点
    const box3 = new THREE.Box3();
    box3.expandByObject(house);

    const center = box3.getCenter(new THREE.Vector3());
    house.position.set(-center.x, 0, -center.z);
    house.name = "house";

    // 绘制家具（只创建空分组，实际模型由增量 effect 统一加载）
    const furnitures = new THREE.Group();
    furnitures.name = "furnitures";
    house.add(furnitures);

    const helper = new THREE.AxesHelper(30000);
    house.add(helper);
  }, [dataVersion]);

  // 监听家具数据变化，同步更新 3D 和 2D 场景中对应对象的位置/旋转
  // 拖拽结束 → updateFurniture → store 更新 → data.furnitures 引用变化 → 此 effect 执行
  // 监听家具数据变化，同步更新 3D 和 2D 场景中对应对象的位置/旋转，
  // 并为新增的家具创建 3D/2D 对象（拖拽添加时使用）
  // 依赖 dataVersion 确保初次挂载和切换户型时也会加载家具
  useEffect(() => {
    const house3D = scene3DRef.current?.getObjectByName("house");
    const house2D = scene2DRef.current?.getObjectByName("house");

    if (!house3D && !house2D) return;

    const furnituresGroup3D = house3D?.getObjectByName("furnitures");
    const furnituresGroup2D = house2D?.getObjectByName("furnitures");

    data.furnitures.forEach((furniture) => {
      // ---------- 3D 场景 ----------
      const obj3D = house3D?.getObjectByName(furniture.id);
      if (obj3D) {
        obj3D.position.set(
          furniture.position.x,
          furniture.position.y,
          furniture.position.z,
        );
        obj3D.rotation.x = furniture.rotation.x;
        obj3D.rotation.y = furniture.rotation.y;
        obj3D.rotation.z = furniture.rotation.z;
      } else if (furnituresGroup3D && !loading3D.current.has(furniture.id)) {
        // 新增家具（且当前没有正在进行的加载）：加载 GLTF 模型到 3D 场景
        loading3D.current.add(furniture.id);
        modelMap[furniture.modelUrl].then((gltf) => {
          gltf.scene = gltf.scene.clone();
          furnituresGroup3D.add(gltf.scene);
          gltf.scene.scale.set(
            furniture.scale?.x || 1,
            furniture.scale?.y || 1,
            furniture.scale?.z || 1,
          );
          gltf.scene.position.set(
            furniture.position.x,
            furniture.position.y,
            furniture.position.z,
          );
          gltf.scene.rotation.x = furniture.rotation.x;
          gltf.scene.rotation.y = furniture.rotation.y;
          gltf.scene.rotation.z = furniture.rotation.z;
          gltf.scene.traverse((obj) => {
            (obj as any).target = gltf.scene;
          });
          gltf.scene.name = furniture.id;
          loading3D.current.delete(furniture.id);
        });

        // const gltfLoader = new GLTFLoader();
        // gltfLoader.load(
        //   furniture.modelUrl,
        //   (gltf) => {
        //     furnituresGroup3D.add(gltf.scene);
        //     gltf.scene.scale.set(
        //       furniture.scale?.x || 1,
        //       furniture.scale?.y || 1,
        //       furniture.scale?.z || 1,
        //     );
        //     gltf.scene.position.set(
        //       furniture.position.x,
        //       furniture.position.y,
        //       furniture.position.z,
        //     );
        //     gltf.scene.rotation.x = furniture.rotation.x;
        //     gltf.scene.rotation.y = furniture.rotation.y;
        //     gltf.scene.rotation.z = furniture.rotation.z;
        //     gltf.scene.traverse((obj) => {
        //       (obj as any).target = gltf.scene;
        //     });
        //     gltf.scene.name = furniture.id;
        //     loading3D.current.delete(furniture.id);
        //   },
        //   (xhr) =>
        //     console.log(
        //       (xhr.loaded / xhr.total) * 100 + "% loaded",
        //       furniture.id,
        //     ),
        // );
      }

      // ---------- 2D 场景（2D 坐标与 3D 取反） ----------
      const obj2D = house2D?.getObjectByName(furniture.id);
      if (obj2D) {
        obj2D.position.set(
          -furniture.position.x,
          -furniture.position.y,
          -furniture.position.z,
        );
        obj2D.rotation.x = furniture.rotation.x;
        obj2D.rotation.y = furniture.rotation.y;
        obj2D.rotation.z = furniture.rotation.z;
      } else if (furnituresGroup2D && !loading2D.current.has(furniture.id)) {
        // 新增家具（且当前没有正在进行的加载）：加载 GLTF 模型到 2D 场景
        loading2D.current.add(furniture.id);
        modelMap[furniture.modelUrl].then((gltf) => {
          gltf.scene = gltf.scene.clone();
          furnituresGroup2D.add(gltf.scene);
          gltf.scene.position.set(
            -furniture.position.x,
            -furniture.position.y,
            -furniture.position.z,
          );
          gltf.scene.rotation.x = furniture.rotation.x;
          gltf.scene.rotation.y = furniture.rotation.y;
          gltf.scene.rotation.z = furniture.rotation.z;
          gltf.scene.scale.set(
            furniture.scale?.x || 1,
            furniture.scale?.y || 1,
            furniture.scale?.z || 1,
          );
          gltf.scene.traverse((obj) => {
            (obj as any).target = gltf.scene;
          });
          gltf.scene.name = furniture.id;
          loading2D.current.delete(furniture.id);
        });

        // const gltfLoader2 = new GLTFLoader();
        // gltfLoader2.load(furniture.modelUrl, (gltf) => {
        //   furnituresGroup2D.add(gltf.scene);
        //   gltf.scene.position.set(
        //     -furniture.position.x,
        //     -furniture.position.y,
        //     -furniture.position.z,
        //   );
        //   gltf.scene.rotation.x = furniture.rotation.x;
        //   gltf.scene.rotation.y = furniture.rotation.y;
        //   gltf.scene.rotation.z = furniture.rotation.z;
        //   gltf.scene.scale.set(
        //     furniture.scale?.x || 1,
        //     furniture.scale?.y || 1,
        //     furniture.scale?.z || 1,
        //   );
        //   gltf.scene.traverse((obj) => {
        //     (obj as any).target = gltf.scene;
        //   });
        //   gltf.scene.name = furniture.id;
        //   loading2D.current.delete(furniture.id);
        // });
      }
    });
  }, [data.furnitures, dataVersion]);

  // curMode 变化的时候，修改两个视图的 size
  // 因为要等那两个场景初始化完才能拿到这俩方法，所以放在最后
  useEffect(() => {
    const changeSize3D = changeSize3DRef.current!;
    const changeSize2D = changeSize2DRef.current!;

    if (curMode === "2d") {
      changeSize3D(false);
      changeSize2D(true);
    } else {
      changeSize3D(true);
      changeSize2D(false);
    }
  }, [curMode]);

  // 共享的 drop 处理逻辑：3D 和 2D 场景使用相同的 NDC→ray→addFurniture 流程
  function performDrop(
    item: any,
    monitor: import("react-dnd").DropTargetMonitor,
    containerId: string,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
  ) {
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) return;

    const dom = document.getElementById(containerId)!;
    const rect = dom.getBoundingClientRect();

    // 将屏幕坐标转换为 NDC（归一化设备坐标）
    const offsetX = clientOffset.x - rect.x;
    const offsetY = clientOffset.y - rect.y;

    const { x: width, y: height } = renderer.getSize(new THREE.Vector2());

    const ndcY = -((offsetY / height) * 2 - 1);
    const ndcX = (offsetX / width) * 2 - 1;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    // 两个场景的 floors 组都挂载在 scene 下，结构相同
    const scene =
      containerId === "threejs-2d-container"
        ? scene2DRef.current!
        : scene3DRef.current!;

    // 查找 "floors" 组（3D 场景 / 新版 2D 场景）
    let floorGroup = scene.getObjectByName("floors");
    // 兼容处理：2D 旧版数据中地板直接挂在 house 下，没有 "floors" 组
    if (!floorGroup) {
      const house = scene.getObjectByName("house");
      if (!house) {
        console.warn("[drop] floors 组和 house 组都不存在，跳过家具添加");
        return;
      }
      floorGroup = house;
    }
    const intersections = rayCaster.intersectObjects(floorGroup.children);

    if (intersections.length) {
      const point = intersections[0].point;

      // 从拖拽数据中读取家具类型
      const furnitureType: string = item?.furnitureType || "dining-table";
      const config = getFurnitureConfig(furnitureType);

      // 将世界坐标转换为 house 组的局部坐标
      const house = scene.getObjectByName("house");
      if (!house) {
        console.warn("[drop] house 组不存在，跳过家具添加");
        return;
      }

      const localPoint = point.clone();
      house.worldToLocal(localPoint);

      // 2D 场景的坐标取反约定：与世界坐标系取反，匹配 2D 渲染时的取反逻辑
      if (containerId === "threejs-2d-container") {
        localPoint.negate();
      }

      addFurniture({
        id: "furniture" + Math.random().toString().slice(2, 8),
        modelUrl: config.modelUrl,
        position: {
          x: localPoint.x,
          y: 0,
          z: localPoint.z,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        scale: { ...config.scale },
      });
    }
  }

  // 注册 3D 容器为拖放目标
  const [, drop3D] = useDrop({
    accept: "家具",
    drop: (item: any, monitor) =>
      performDrop(
        item,
        monitor,
        "threejs-3d-container",
        rendererRef.current!,
        camera3DRef.current!,
      ),
  });

  // 注册 2D 容器为拖放目标
  const [, drop2D] = useDrop({
    accept: "家具",
    drop: (item: any, monitor) =>
      performDrop(
        item,
        monitor,
        "threejs-2d-container",
        renderer2DRef.current!,
        camera2DRef.current!,
      ),
  });

  useEffect(() => {
    // 组件挂载后，将两个容器的 DOM 都注册为可放置区域
    drop3D(document.getElementById("threejs-3d-container"));
    drop2D(document.getElementById("threejs-2d-container"));
  }, []);

  // 删除选中的家具：清理 3D/2D 场景对象，然后从 store 中移除
  const deleteFurniture = useCallback(
    (id: string) => {
      // 从 3D 场景中移除
      const scene3D = scene3DRef.current;
      const house3D = scene3D?.getObjectByName("house");
      const obj3D = house3D?.getObjectByName(id);
      if (obj3D) {
        obj3D.parent?.remove(obj3D);
        obj3D.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material?.dispose();
            }
          }
        });
      }

      // 从 2D 场景中移除
      const scene2D = scene2DRef.current;
      const house2D = scene2D?.getObjectByName("house");
      const obj2D = house2D?.getObjectByName(id);
      if (obj2D) {
        obj2D.parent?.remove(obj2D);
        obj2D.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material?.dispose();
            }
          }
        });
      }

      // detach TransformControls
      detachControls3DRef.current?.();
      detachControls2DRef.current?.();

      setSelectedId(null);
      removeFurniture(id);
    },
    [removeFurniture],
  );

  // 监听 Delete 键删除选中的家具
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) {
        deleteFurniture(selectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteFurniture]);

  // 切换 2D/3D 视图时取消选中
  useEffect(() => {
    setSelectedId(null);
  }, [curMode]);

  return (
    <div className="Main">
      <div
        id="threejs-3d-container"
        // style={{ display: curMode === "3d" ? "block" : "none" }}
        style={{ zIndex: curMode === "2d" ? 2 : 1 }}
      ></div>
      <div
        id="threejs-2d-container"
        // style={{ display: curMode === "2d" ? "block" : "none" }}
        style={{ zIndex: curMode === "3d" ? 2 : 1 }}
      ></div>
      <div className="mode-change-btns">
        <Button
          type={curMode === "2d" ? "primary" : "default"}
          onClick={() => setCurMode("2d")}
        >
          2D
        </Button>
        <Button
          type={curMode === "3d" ? "primary" : "default"}
          onClick={() => setCurMode("3d")}
        >
          3D
        </Button>
        <Button
          onClick={() => {
            changeModeRef.current?.(true);
            changeMode2DRef.current?.(true);
          }}
        >
          平移
        </Button>
        <Button
          onClick={() => {
            changeModeRef.current?.(false);
            changeMode2DRef.current?.(false);
          }}
        >
          旋转
        </Button>
      </div>
    </div>
  );
}

export default Main;
