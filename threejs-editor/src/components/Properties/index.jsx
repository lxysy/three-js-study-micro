import { useThreeStore } from "../../store";
import { useEffect, useMemo, useState } from "react";
import Info from "./info";
import { Segmented, Tree } from "antd";
import MonacoEditor from "@monaco-editor/react";

function Properties() {
  const { data, selectedObj, scene, setSelectedObjName, selectedObjName } =
    useThreeStore();

  // const treeData = useMemo(() => {
  //   if (!scene?.children) return;
  //   const tree = scene.children
  //     .map((item) => {
  //       // 过滤掉 transform controls 根节点
  //       if (item.isTransformControlsRoot) {
  //         return null;
  //       }
  //       return {
  //         title: item.isMesh ? item.geometry.type : item.type,
  //         key: item.type + item.name + item.id,
  //         name: item.name,
  //       };
  //     })
  //     .filter((item) => item !== null);

  //   return [
  //     {
  //       title: "Scene",
  //       key: "root",
  //       children: tree,
  //     },
  //   ];
  // }, [scene]);

  // scene 变了 → React 渲染
  // useEffect 执行 → setTreeData(...) → React 再渲染一次
  // const [treeData, setTreeData] = useState();
  // useEffect(() => {
  //   if (scene) {
  //     // 每次都是全新对象 → 引用不同 → 肯定触发渲染
  //     setTreeData([
  //       {
  //         title: "Scene",
  //         key: "root",
  //         children: scene,
  //       },
  //     ]);
  //   }
  // }, [scene]);

  // useMemo 缓存 scene 变化时的 treeData
  const treeData = useMemo(() => {
    return [
      {
        title: "Scene",
        key: "root",
        // 在threejs-editor\src\components\Main\index.jsx中保存的是过滤之后的tree了，这里直接使用
        children: scene,
      },
    ];
  }, [scene]);

  function handleSelect(selectKeys, info) {
    const name = info.node.name;
    setSelectedObjName(name);
  }

  const [key, setKey] = useState("属性");
  return (
    <div className="Properties">
      <Segmented
        value={key}
        onChange={setKey}
        block
        options={["属性", "json"]}
      />
      {key === "属性" ? (
        <div>
          <Tree
            treeData={treeData}
            expandedKeys={["root"]}
            onSelect={handleSelect}
          />
          <Info />
        </div>
      ) : null}
      {key === "json" ? (
        <MonacoEditor
          height={"90%"}
          path="code.json"
          language="json"
          value={JSON.stringify(data, null, 2)}
        />
      ) : null}
      {/* <Tree
        treeData={treeData}
        expandedKeys={["root"]}
        onSelect={handleSelect}
      />
      <Info />
      <div>selectedObjName: {selectedObjName}</div>
      <div>selectedObj: {selectedObj?.name}</div> */}
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}

export default Properties;
