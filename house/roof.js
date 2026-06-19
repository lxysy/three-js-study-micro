import * as THREE from "three";

const loader = new THREE.TextureLoader();
const texture = loader.load("./wapian.png");
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapS = THREE.RepeatWrapping;
texture.repeat.x = 4;

const geometry = new THREE.BoxGeometry(4200, 2000, 100);
const material = new THREE.MeshLambertMaterial({
//   color: new THREE.Color("red"),
  aoMap: texture,
  map: texture,
});

const roof = new THREE.Mesh(geometry, material);
roof.position.y = 2600;
roof.position.z = -800;
roof.rotation.x = (55 / 180) * Math.PI;

export default roof;
