import type { State } from ".";

const data: State["data"] = {
  walls: [
    {
      position: { x: 0, y: 0, z: 0 },
      width: 800,
      height: 500,
      depth: 30,
      windows: [
        {
          leftBottomPosition: {
            left: 100,
            bottom: 50,
          },
          width: 300,
          height: 300,
        },
      ],
    },
    {
      position: { x: 0, y: 0, z: 770 },
      width: 800,
      height: 500,
      depth: 30,
      windows: [
        {
          leftBottomPosition: {
            left: 100,
            bottom: 100,
          },
          width: 600,
          height: 300,
        },
      ],
    },
    {
      position: { x: 0, y: 0, z: 0 },
      width: 800,
      height: 500,
      depth: 30,
      rotationY: -Math.PI / 2,
      windows: [],
    },
    {
      position: { x: 800, y: 0, z: 0 },
      width: 800,
      height: 500,
      depth: 30,
      rotationY: -Math.PI / 2,
      windows: [],
      doors: [
        {
          leftBottomPosition: {
            left: 200,
            bottom: 20,
          },
          width: 300,
          height: 400,
        },
      ],
    },
  ],
  floors: [
    {
      points: [
        { x: 0, z: 0 },
        { x: 0, z: 800 },
        { x: 800, z: 800 },
        { x: 800, z: 0 },
        { x: 0, z: 0 },
      ],
    },
  ],
  ceilings: [
    {
      points: [
        { x: 0, z: 0 },
        { x: 0, z: 800 },
        { x: 800, z: 800 },
        { x: 800, z: 0 },
        { x: 0, z: 0 },
      ],
      height: 500,
    },
  ],
};

export default data;
