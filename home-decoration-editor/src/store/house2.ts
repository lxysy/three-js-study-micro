import type { State } from ".";

const data: State["data"] = {
  walls: [
    {
      position: { x: 0, y: 0, z: 0 },
      width: 2880,
      height: 3000,
      depth: 200,
      windows: [],
      normal: { x: 0, y: 0, z: 1 },
      text: {
        position: { y: -300 },
      },
      doors: [
        {
          position: { y: 0 },
          rotation: {
            rotateZ: Math.PI / 2,
          },
          leftBottomPosition: {
            left: 1680,
            bottom: 0,
          },
          width: 1000,
          height: 2000,
        },
      ],
    },
    {
      position: { x: 0, y: 0, z: 0 },
      width: 5000,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
      normal: { x: 1, y: 0, z: 0 },
    },
    {
      position: { x: -5000, y: 0, z: 5000 },
      width: 5000,
      height: 3000,
      depth: 200,
      windows: [],
      text: {
        position: { y: -300 },
      },
      normal: { x: 0, y: 0, z: 1 },
    },
    {
      position: { x: -5000, y: 0, z: 5000 },
      width: 1880,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
      normal: { x: 1, y: 0, z: 0 },
    },
    {
      position: { x: -5200, y: 0, z: 6880 },
      width: 3000,
      height: 3000,
      depth: 200,
      normal: { x: 0, y: 0, z: -1 },
      windows: [
        {
          leftBottomPosition: {
            left: 830,
            bottom: 900,
          },
          width: 1200,
          height: 1400,
        },
      ],
    },
    {
      position: { x: -2000, y: 0, z: 6880 },
      width: 1380,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
      normal: { x: 1, y: 0, z: 0 },
    },
    {
      position: { x: -2200, y: 0, z: 8260 },
      width: 2880,
      height: 3000,
      depth: 200,
      normal: { x: 0, y: 0, z: -1 },
      windows: [
        {
          leftBottomPosition: {
            left: 355,
            bottom: 0,
          },
          width: 2140,
          height: 2400,
        },
      ],
    },
    {
      position: { x: 880, y: 0, z: 7080 },
      width: 1380,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
      normal: { x: -1, y: 0, z: 0 },
    },
    {
      position: { x: 880, y: 0, z: 7080 },
      width: 2000,
      height: 3000,
      depth: 200,
      normal: { x: 0, y: 0, z: -1 },
      windows: [],
    },
    {
      position: { x: 2880, y: 0, z: 200 },
      width: 6880,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      normal: { x: -1, y: 0, z: 0 },
      text: {
        position: { y: -300 },
      },
      windows: [
        {
          leftBottomPosition: {
            left: 1200,
            bottom: 900,
          },
          width: 790,
          height: 1400,
        },
        {
          leftBottomPosition: {
            left: 3680,
            bottom: 900,
          },
          width: 3000,
          height: 1400,
        },
      ],
    },
  ],
  floors: [
    {
      points: [
        { x: -2000, z: 5000 },
        { x: -5000, z: 5000 },
        { x: -5000, z: 6680 },
        { x: -2000, z: 6680 },
        { x: -2000, z: 5000 },
      ],
      name: "书房",
      size: 5.64,
    },
    {
      points: [
        { x: 0, z: 0 },
        { x: 2680, z: 0 },
        { x: 2680, z: 6900 },
        { x: 680, z: 6900 },
        { x: 680, z: 8100 },
        { x: -2000, z: 8100 },
        { x: -2000, z: 6680 },
        { x: -2000, z: 5000 },
        { x: -2000, z: 5000 },
        { x: 0, z: 5000 },
        { x: 0, z: 0 },
      ],
      textureUrl: "./floor-texture2.png",
      name: "客餐厅",
      size: 28.89,
    },
  ],
  ceilings: [
    {
      points: [
        { x: -2000, z: 5200 },
        { x: -5000, z: 5200 },
        { x: -5000, z: 7000 },
        { x: -2000, z: 7000 },
        { x: -2000, z: 5200 },
      ],
      height: 3000,
    },
    {
      points: [
        { x: 0, z: 0 },
        { x: 2880, z: 0 },
        { x: 2880, z: 7180 },
        { x: 880, z: 7180 },
        { x: 880, z: 8380 },
        { x: -2000, z: 8380 },
        { x: -2000, z: 6880 },
        { x: -2000, z: 5000 },
        { x: -2000, z: 5000 },
        { x: 0, z: 5000 },
        { x: 0, z: 0 },
      ],
      height: 3000,
    },
  ],
  furnitures: [
    {
      id: "1",
      modelUrl: "./dining-table.glb",
      position: {
        x: 1500,
        y: 0,
        z: 3000,
      },
      rotation: {
        x: 0,
        y: Math.PI / 2,
        z: 0,
      },
      scale: {
        x: 1000,
        y: 1000,
        z: 1000,
      },
    },
    {
      id: "furniture222",
      modelUrl: "./bed2.glb",
      scale: {
        x: 20,
        y: 20,
        z: 20,
      },
      position: {
        x: -647.4215938726065,
        y: 0,
        z: 7164.314346338078,
      },
      rotation: {
        x: 0,
        y: 1.5,
        z: 0,
      },
    },
  ],
};

export default data;
