import * as THREE from "three";

const geometry = new THREE.BoxGeometry(4000, 2000, 100);

const loader = new THREE.TextureLoader();
const texture = loader.load("./zhuan.jpg");
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapS = THREE.RepeatWrapping;
texture.repeat.x = 2;

const material = new THREE.MeshLambertMaterial({
  color: new THREE.Color("lightgrey"),
  map: texture,
  aoMap: texture,
});

const behindWall = new THREE.Mesh(geometry, material);
behindWall.translateY(1150);
behindWall.translateZ(-1450);
console.log(111,behindWall);

export default behindWall;
