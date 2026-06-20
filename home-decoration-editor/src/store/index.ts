import { create } from "zustand";
import data from "./house2";

interface Wall {
  position: { x: number; y: number; z: number };
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
}

interface Ceiling {
  points: Array<{
    x: number;
    z: number;
  }>;
  height: number;
}

export interface State {
  data: {
    walls: Array<Wall>;
    floors: Array<Floor>;
    ceilings: Array<Ceiling>;
  };
}

const useHouseStore = create<State>((set, get) => {
  return {
    // data: {
    //   walls: [
    //     {
    //       position: { x: 0, y: 0, z: 0 },
    //       width: 800,
    //       height: 500,
    //       depth: 30,
    //       windows: [
    //         {
    //           leftBottomPosition: {
    //             left: 100,
    //             bottom: 50,
    //           },
    //           width: 300,
    //           height: 300,
    //         },
    //       ],
    //     },
    //     {
    //       position: { x: 0, y: 0, z: 770 },
    //       width: 800,
    //       height: 500,
    //       depth: 30,
    //       windows: [
    //         {
    //           leftBottomPosition: {
    //             left: 100,
    //             bottom: 100,
    //           },
    //           width: 600,
    //           height: 300,
    //         },
    //       ],
    //     },
    //     {
    //       position: { x: 0, y: 0, z: 0 },
    //       width: 800,
    //       height: 500,
    //       depth: 30,
    //       rotationY: -Math.PI / 2,
    //       windows: [],
    //     },
    //     {
    //       position: { x: 800, y: 0, z: 0 },
    //       width: 800,
    //       height: 500,
    //       depth: 30,
    //       rotationY: -Math.PI / 2,
    //       windows: [],
    //       doors: [
    //         {
    //           leftBottomPosition: {
    //             left: 200,
    //             bottom: 20,
    //           },
    //           width: 300,
    //           height: 400,
    //         },
    //       ],
    //     },
    //   ],
    //   floors: [
    //     {
    //       points: [
    //         { x: 0, z: 0 },
    //         { x: 0, z: 800 },
    //         { x: 800, z: 800 },
    //         { x: 800, z: 0 },
    //         { x: 0, z: 0 },
    //       ],
    //     },
    //   ],
    //   ceilings: [
    //     {
    //       points: [
    //         { x: 0, z: 0 },
    //         { x: 0, z: 800 },
    //         { x: 800, z: 800 },
    //         { x: 800, z: 0 },
    //         { x: 0, z: 0 },
    //       ],
    //       height: 500,
    //     },
    //   ],
    // },
    data: data,
  };
});

export { useHouseStore };
