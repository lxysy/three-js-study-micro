import { create, type StateCreator } from "zustand";
import data from "./house2.ts";
import type { Vector3 } from "three";
import { persist } from "zustand/middleware";

interface Wall {
  position: { x: number; y: number; z: number };
  text?: {
    position?: { x?: number; y?: number; z?: number };
  };
  width: number;
  height: number;
  depth: number;
  rotationY?: number;
  normal: { x: number; y: number; z: number };
  windows: Array<{
    leftBottomPosition: {
      left: number;
      bottom: number;
    };
    width: number;
    height: number;
  }>;
  doors?: Array<{
    rotation?: {
      rotateX?: number;
      rotateY?: number;
      rotateZ?: number;
    };
    position?: {
      x?: number;
      y?: number;
      z?: number;
    };
    leftBottomPosition: {
      left: number;
      bottom: number;
    };
    width: number;
    height: number;
  }>;
}

interface Floor {
  points: Array<{
    x: number;
    z: number;
  }>;
  textureUrl?: string;
  name?: string;
  size?: number;
}

interface Ceiling {
  points: Array<{
    x: number;
    z: number;
  }>;
  height: number;
}

interface Furniture {
  id: string;
  modelUrl: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale?: { x: number; y: number; z: number };
}

export interface State {
  data: {
    walls: Array<Wall>;
    floors: Array<Floor>;
    ceilings: Array<Ceiling>;
    furnitures: Array<Furniture>;
  };
  dataVersion: number;
}

export interface Action {
  setData(data: State["data"]): void;
  updateFurniture(
    id: string,
    type: "position" | "rotation",
    info: Vector3,
  ): void;
  addFurniture(furniture: Furniture): void;
  removeFurniture(id: string): void;
}

const stateCreator: StateCreator<State & Action> = (set, get) => {
  return {
    data: data,
    dataVersion: 0,
    setData(data) {
      set((state) => {
        return {
          ...state,
          data: data,
          dataVersion: state.dataVersion + 1,
        };
      });
    },
    updateFurniture(id, type, info) {
      set((state) => {
        return {
          ...state,
          data: {
            ...state.data,
            furnitures: state.data.furnitures.map((item) => {
              if (item.id === id) {
                if (type === "position") {
                  // 不可变更新：创建新对象而非原地修改，确保 Zustand 的引用比较能正确检测变化
                  return {
                    ...item,
                    position: { x: info.x, y: info.y, z: info.z },
                  };
                } else {
                  return {
                    ...item,
                    rotation: { x: info.x, y: info.y, z: info.z },
                  };
                }
              }
              return item;
            }),
          },
        };
      });
    },
    addFurniture(furniture) {
      set((state) => {
        return {
          ...state,
          data: {
            ...state.data,
            furnitures: [...state.data.furnitures, furniture],
          },
        };
      });
    },
    removeFurniture(id) {
      set((state) => {
        return {
          ...state,
          data: {
            ...state.data,
            furnitures: state.data.furnitures.filter((item) => item.id !== id),
          },
          dataVersion: state.dataVersion + 1,
        };
      });
    },
  };
};

// const useHouseStore = create<State & Action>()(
//   persist(stateCreator, {
//     name: "house",
//     partialize: (state) => ({
//       // 不持久化 data——它来自模块导入，是数据源
//       // 只持久化运行时修改的字段（当前为空，但仍保留 persist 以备后续扩展）
//     }),
//   })
// );

// 持久化仓库 类型柯里化
const useHouseStore = create<State & Action>()(
  persist(stateCreator, {
    name: "house",
  }),
);

export { useHouseStore };
