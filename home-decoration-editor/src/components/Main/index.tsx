import { useEffect, useRef, useState } from "react";
import { init3D } from "./init-3d.ts";
import { init2D } from "./init-2d.ts";
import { Button } from "antd";
import * as THREE from "three";
import { useHouseStore } from "../../store/index.ts";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

// 我们用一个全局变量来存储窗户模型，这样全局只加载一次
let winModel: { model: THREE.Group; size: THREE.Vector3 } | null = null;
async function loadWindow() {
  if (winModel !== null) {
    return winModel;
  } else {
    const group = new THREE.Group();
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("./window.glb");
    group.add(gltf.scene);

    // 加载 GLTF 模型后，你不知道它到底有多大。用 Box3 算一下模型的实际尺寸
    // 创建一个空的轴向包围盒（Axis-Aligned Bounding Box
    const box = new THREE.Box3();
    // 遍历模型的所有几何体，计算出能包住整个模型的最小立方体
    box.expandByObject(gltf.scene);

    // 获取这个包围盒的尺寸 (width, height, depth)
    const size = box.getSize(new THREE.Vector3());
    console.log("size", size);
    winModel = {
      model: group,
      size,
    };
    return winModel;
  }
}
// 我们用一个全局变量来存储门模型，这样全局只加载一次
let doorModel: { model: THREE.Group; size: THREE.Vector3 } | null = null;
async function loadDoor() {
  if (doorModel !== null) {
    return doorModel;
  } else {
    const group = new THREE.Group();
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("./door.glb");
    group.add(gltf.scene);

    const box = new THREE.Box3();
    box.expandByObject(gltf.scene);

    const size = box.getSize(new THREE.Vector3());
    // console.log('size', size)
    doorModel = {
      model: group,
      size,
    };
    return doorModel;
  }
}

function Main() {
  const scene3DRef = useRef<THREE.Scene>(null);
  const scene2DRef = useRef<THREE.Scene>(null);
  const camera3DRef = useRef<THREE.Camera>(null);
  const { data } = useHouseStore();

  // 计算墙的可见性 相机和墙的方向向量的点积大于0时（锐角），墙不可见
  function wallsVisibilityCalc() {
    const camera = camera3DRef.current!;
    const scene = scene3DRef.current;

    if (!camera) {
      return;
    }
    data.walls.forEach((item, index) => {
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const wallDirection = new THREE.Vector3(
        item.normal.x,
        item.normal.y,
        item.normal.z
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
    const { scene, camera } = init3D(dom, wallsVisibilityCalc);

    scene3DRef.current = scene;
    camera3DRef.current = camera;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const dom = document.getElementById("threejs-2d-container")!;
    const { scene } = init2D(dom);

    scene2DRef.current = scene;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  // 根据仓库中的数据绘制3D场景
  useEffect(() => {
    const house = new THREE.Group();
    const scene = scene3DRef.current!;
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
        // color: "orange",
        map: texture,
        side: THREE.BackSide,
      });
      console.log("geometry", geometry);
      const floor = new THREE.Mesh(geometry, material);
      floor.rotateX(Math.PI / 2);

      return floor;
    });
    // scene.add(...floors);
    house.add(...floors);

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
    scene.add(house);

    // 计算包围盒 包围盒中心居中
    const box3 = new THREE.Box3();
    box3.expandByObject(house);

    const center = box3.getCenter(new THREE.Vector3());
    house.position.set(-center.x, 0, -center.z);
  }, [data]);

  // 根据仓库中的数据绘制2D场景
  // useEffect(() => {
  //   const scene = scene2DRef.current!;
  //   const walls = data.walls.map((item) => {
  //     const shape = new THREE.Shape();
  //     shape.moveTo(item.p1.x, item.p1.z);
  //     shape.lineTo(item.p2.x, item.p2.z);
  //     shape.lineTo(item.p3.x, item.p3.z);
  //     shape.lineTo(item.p4.x, item.p4.z);
  //     shape.lineTo(item.p1.x, item.p1.z);
  //     const geometry = new THREE.ShapeGeometry(shape);
  //     const material = new THREE.MeshPhongMaterial({
  //       color: "white",
  //     });
  //     const wall = new THREE.Mesh(geometry, material);
  //     wall.rotateX(-Math.PI / 2);
  //     return wall;
  //   });

  //   scene.add(...walls);
  // }, [data]);

  // 切换按钮
  const [curMode, setCurMode] = useState("2d");

  return (
    <div className="Main">
      <div
        id="threejs-3d-container"
        style={{ display: curMode === "3d" ? "block" : "none" }}
      ></div>
      <div
        id="threejs-2d-container"
        style={{ display: curMode === "2d" ? "block" : "none" }}
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
      </div>
    </div>
  );
}

export default Main;
