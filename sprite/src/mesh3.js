import * as THREE from "three";

const loader = new THREE.TextureLoader();
const texture = loader.load("./snow.png");
const spriteMaterial = new THREE.SpriteMaterial({
  map: texture,
});

const group = new THREE.Group();

for (let i = 0; i < 10000; i++) {
  const sprite = new THREE.Sprite(spriteMaterial);

  const x = 1000 * Math.random();
  const y = 1000 * Math.random();
  const z = 1000 * Math.random();
  sprite.position.set(x, y, z);

  group.add(sprite);
}

// 这个 y 每次下降的高度还有另一种写法
// 用 Clock 的 getDelta 可以拿到每次渲染的时间间隔，可以用它来做 y 的下降高度
const clock = new THREE.Clock();
function render() {
  const delta = clock.getDelta();
  group.children.forEach((sprite) => {
    // sprite.position.y -= 0.1;
    sprite.position.y -= delta * 10;

    if (sprite.position.y < 0) {
      sprite.position.y = 1000;
    }
  });

  requestAnimationFrame(render);
}

render();

export default group;
