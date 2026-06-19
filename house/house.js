import * as THREE from "three";
import foundation from "./foundation.js";
import sideWall from "./side-wall.js";
import behindWall from "./behind-wall.js";
import frontWall from "./front-wall.js";
import roof from "./roof.js";
import doorstep from "./doorstep.js";
import grass from "./grass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const house = new THREE.Group();
const sideWall2 = sideWall.clone();
const roof2 = roof.clone();
roof2.rotateX((70 / 180) * Math.PI);
roof2.position.z = -roof.position.z;

const gui = new GUI();
const sideWallFolder = gui.addFolder("侧面1");
sideWallFolder.add(sideWall.position, "x").min(-10000).max(10000).step(10);
sideWallFolder.add(sideWall.position, "y").min(-10000).max(10000).step(10);
sideWallFolder.add(sideWall.position, "z").min(-10000).max(10000).step(10);

const sideWallFolder2 = gui.addFolder("侧面2");
sideWallFolder2.add(sideWall2.position, "x").min(-10000).max(10000).step(10);
sideWallFolder2.add(sideWall2.position, "y").min(-10000).max(10000).step(10);
sideWallFolder2.add(sideWall2.position, "z").min(-10000).max(10000).step(10);

const obj = {
  rotateX: 0,
  width: 2000,
};
const roofFolder = gui.addFolder("屋顶");
roofFolder.add(roof.position, "y").min(-10000).max(10000).step(100);
roofFolder.add(roof.position, "z").min(-10000).max(10000).step(100);
roofFolder.addColor(roof.material, "color");
roofFolder
  .add(obj, "rotateX")
  .min(0)
  .max(180)
  .step(0.1)
  .onChange((value) => {
    roof.rotation.x = (value / 180) * Math.PI;
  });
roofFolder
  .add(obj, "width")
  .min(1000)
  .max(5000)
  .step(100)
  .onChange((value) => {
    roof.geometry = new THREE.BoxGeometry(4200, value, 100);
  });

// 逆时针是正的 这里绕Y轴旋转90度
sideWall.rotateY(Math.PI / 2);
sideWall.translateZ(-2000);
sideWall.translateX(1500);
sideWall.translateY(150);

sideWall2.rotateY(Math.PI / 2);
sideWall2.translateZ(1900);
sideWall2.translateX(1500);
sideWall2.translateY(150);

house.add(foundation);
house.add(sideWall);
house.add(sideWall2);
house.add(behindWall);
house.add(frontWall);
house.add(roof);
house.add(roof2);
house.add(doorstep);
house.add(grass);

export { gui };
export default house;
