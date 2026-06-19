import { useEffect, useRef } from "react";
import { init } from "./init";
import { MeshTypes, useThreeStore } from "../../store";
import * as THREE from "three";
import { FloatButton } from "antd";
import {
  ArrowsAltOutlined,
  DragOutlined,
  RetweetOutlined,
} from "@ant-design/icons";

function Main() {
  const {
    data,
    addMesh,
    setScene,
    setSelectedObj,
    selectedObj,
    removeMesh,
    updateMeshInfo,
    selectedObjName,
  } = useThreeStore();
  const sceneRef = useRef();
  const transformControlsRef = useRef();
  const transformControlsModeRef = useRef();
  const transformControlsAttachObjRef = useRef();

  function onSelected(obj) {
    setSelectedObj(obj);
  }

  // 初始化
  useEffect(() => {
    const dom = document.getElementById("threejs-container");
    const {
      scene,
      transformControls,
      setTransformControlsMode,
      transformControlsAttachObj,
    } = init(dom, data, onSelected, updateMeshInfo);
    sceneRef.current = scene;
    transformControlsRef.current = transformControls;
    transformControlsModeRef.current = setTransformControlsMode;
    transformControlsAttachObjRef.current = transformControlsAttachObj;

    // 初始化场景 存入仓库 用于显示场景树在Properties组件中
    const tree = scene.children
      .map((item) => {
        if (item.isTransformControlsRoot) {
          return null;
        }

        return {
          title: item.isMesh ? item.geometry.type : item.type,
          key: item.type + item.name + item.id,
          name: item.name,
        };
      })
      .filter((item) => item !== null);

    setScene(tree);

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  // 根据仓库中的数据变化更新场景
  useEffect(() => {
    const scene = sceneRef.current;

    data.meshArr.forEach((item) => {
      if (item.type === MeshTypes.Box) {
        const {
          width,
          height,
          depth,
          material: { color },
          position,
          scale,
          rotation,
        } = item.props;
        // 尝试从场景中按名字查找对应的 mesh
        let mesh = scene.getObjectByName(item.name);

        // 存在即复用，不存在则创建
        if (!mesh) {
          const geometry = new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshPhongMaterial({
            color,
          });
          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        }

        mesh.name = item.name;
        mesh.position.copy(position);
        mesh.scale.copy(scale);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        mesh.material.color = new THREE.Color(color);
      } else if (item.type === MeshTypes.Cylinder) {
        const {
          radiusTop,
          radiusBottom,
          height,
          material: { color },
          position,
          scale,
          rotation,
        } = item.props;
        let mesh = scene.getObjectByName(item.name);

        if (!mesh) {
          const geometry = new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            height
          );
          const material = new THREE.MeshPhongMaterial({
            color,
          });
          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        }

        mesh.name = item.name;
        mesh.position.copy(position);
        mesh.scale.copy(scale);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        mesh.material.color = new THREE.Color(color);
      }
    });

    // 渲染完物体之后也重新更新一下 scene
    // react 会浅层对比 scene 有没有变化，这里 clone 一下来触发更新
    const tree = scene.children
      .map((item) => {
        if (item.isTransformControlsRoot) {
          return null;
        }

        return {
          title: item.isMesh ? item.geometry.type : item.type,
          key: item.type + item.name + item.id,
          name: item.name,
        };
      })
      .filter((item) => item !== null);

    setScene(tree);
  }, [data]);

  // 按delete删除选中的mesh
  useEffect(() => {
    function handleKeydown(e) {
      if (e.key === "Backspace" || e.key === "Delete") {
        transformControlsRef.current.detach();
        sceneRef.current.remove(selectedObj);
        removeMesh(selectedObj.name);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [selectedObj]);

  // 仓库中的选中项被右边树状结构中的物体点击时改变，绑定到变换控制器上
  useEffect(() => {
    if (selectedObjName) {
      const obj = sceneRef.current.getObjectByName(selectedObjName);
      setSelectedObj(obj);
      transformControlsAttachObjRef.current(obj);
    }
  }, [selectedObjName]);

  return (
    <div className="Main" id="threejs-container">
      <FloatButton.Group className="btn-group">
        <FloatButton
          icon={<DragOutlined />}
          onClick={() => transformControlsModeRef.current("translate")}
        />
        <FloatButton
          icon={<RetweetOutlined />}
          onClick={() => transformControlsModeRef.current("rotate")}
        />
        <FloatButton
          icon={<ArrowsAltOutlined />}
          onClick={() => transformControlsModeRef.current("scale")}
        />
      </FloatButton.Group>
    </div>
  );
}

export default Main;
