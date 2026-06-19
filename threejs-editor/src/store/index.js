import { create } from "zustand";
import { persist } from "zustand/middleware";

function createBox() {
  const newId = Math.random().toString().slice(2, 8);
  return {
    id: newId,
    type: "Box",
    name: "Box" + newId,
    props: {
      width: 200,
      height: 200,
      depth: 200,
      material: {
        color: "orange",
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      scale: {
        x: 1,
        y: 1,
        z: 1,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  };
}

function createCylinder() {
  const newId = Math.random().toString().slice(2, 8);
  return {
    id: newId,
    type: "Cylinder",
    name: "Cylinder" + newId,
    props: {
      radiusTop: 200,
      radiusBottom: 200,
      height: 300,
      material: {
        color: "orange",
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      scale: {
        x: 1,
        y: 1,
        z: 1,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  };
}

const useThreeStore = create(persist((set, get) => {
  return {
    data: {
      meshArr: [
        // {
        //   id: 1,
        //   type: "Box",
        //   name: "Box1",
        //   props: {
        //     width: 200,
        //     height: 200,
        //     depth: 200,
        //     material: {
        //       color: "orange",
        //     },
        //     position: {
        //       x: 0,
        //       y: 0,
        //       z: 0,
        //     },
        //   },
        // },
      ],
    },
    // 选中的mesh
    selectedObj: null,
    setSelectedObj(obj) {
      set({
        selectedObj: obj,
      });
    },
    // 场景
    scene: null,
    setScene(obj) {
      set({
        scene: obj,
      });
    },
    // 从属性栏中选中的mesh
    selectedObjName: null,
    setSelectedObjName(name) {
      set({
        selectedObjName: name,
      });
    },

    addMesh(type) {
      function addItem(creator) {
        // 因为 react 状态是浅比较，所以这里 set 的新状态需要创建一个新的对象
        // 浅比较（shallow comparison）——也就是比较「引用地址」是否改变，而不是比较「里面的值」是否改变。
        set((state) => {
          return {
            data: {
              ...state.data,
              meshArr: [...state.data.meshArr, creator()],
            },
          };
        });
      }
      if (type === "Box") {
        addItem(createBox);
      } else if (type === "Cylinder") {
        addItem(createCylinder);
      }
    },

    removeMesh(name) {
      set((state) => {
        return {
          data: {
            ...state.data,
            meshArr: state.data.meshArr.filter((mesh) => {
              return mesh.name !== name;
            }),
          },
        };
      });
    },

    updateMeshInfo(name, info, type) {
      // console.log(111, name, info, type);
      set((state) => {
        return {
          data: {
            ...state.data,
            meshArr: state.data.meshArr.map((mesh) => {
              if (mesh.name === name) {
                if (type === "position") {
                  mesh.props.position = { x: info.x, y: info.y, z: info.z };
                } else if (type === "scale") {
                  mesh.props.scale = { x: info.x, y: info.y, z: info.z };
                } else if (type === "rotation") {
                  mesh.props.rotation = {
                    x: info.x,
                    y: info.y,
                    z: info.z,
                  };
                }
              }
              return mesh;
            }),
          },
        };
      });
    },

    // 更新变换后的位置
    // 注意：必须使用不可变更新，创建新对象而非修改原对象。
    // position 存为纯 {x,y,z} 对象而非 Three.js Vector3 引用。
    // updateMeshPosition(name, position) {
    //   set((state) => ({
    //     data: {
    //       ...state.data,
    //       meshArr: state.data.meshArr.map((mesh) => {
    //         if (mesh.name === name) {
    //           return {
    //             ...mesh,
    //             props: {
    //               ...mesh.props,
    //               position: { x: position.x, y: position.y, z: position.z },
    //             },
    //           };
    //         }
    //         return mesh;
    //       }),
    //     },
    //   }));
    // },

    // 更新材质
    updateMaterial(name, info) {
      set((state) => {
        return {
          data: {
            ...state.data,
            meshArr: state.data.meshArr.map((mesh) => {
              if (mesh.name === name) {
                mesh.props.material = {
                  ...mesh.props.material,
                  ...info,
                };
              }
              return mesh;
            }),
          },
        };
      });
    },
  };
},{
  name: "threejs-editor",
}));

const MeshTypes = {
  Box: "Box",
  Cylinder: "Cylinder",
};

export { useThreeStore, MeshTypes };
