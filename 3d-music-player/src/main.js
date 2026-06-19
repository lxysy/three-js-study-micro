import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import player from "./player";
import analyser from "./analyser";
import _ from "lodash-es";
import lyricList, { lyricPositions } from "./lyric";
import { Easing, Group, Tween } from "@tweenjs/tween.js";
import note from "./note";

const scene = new THREE.Scene();
scene.add(note);

// 同心圆柱体
scene.add(analyser);
analyser.position.y = -200;
// 把同心圆环柱的整体高度压扁到原来的一半
analyser.scale.z = 0.5;
//  右手定则：右手握住旋转轴，拇指指向轴的正方向，其余四指弯曲的方向就是正角度旋转方向。
analyser.rotateX(Math.PI / 8);

// 播放暂停按钮
scene.add(player);
player.position.x = 800;
player.position.z = 600;

// 歌词
scene.add(lyricList);
lyricList.position.y = 650;

const directionLight = new THREE.DirectionalLight(0xffffff, 2);
directionLight.position.set(500, 400, 300);
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const helper = new THREE.AxesHelper(500);
scene.add(helper);

const camera = new THREE.PerspectiveCamera(60, width / height, 300, 10000);
camera.position.set(0, 800, 1500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(width, height);

// 加载音频
const listener = new THREE.AudioListener();
const audio = new THREE.Audio(listener);

const loader = new THREE.AudioLoader();
let pendingPlay = false;
loader.load("./superman.mp3", function (buffer) {
  audio.setBuffer(buffer);
  audio.autoplay = false;
  // buffer 加载完时，如果用户已经点过播放按钮，则自动开始播放
  if (pendingPlay) {
    pendingPlay = false;
    audio.context.resume().then(() => audio.play());
  }
});

// 音频分析器
const audioAnalyser = new THREE.AudioAnalyser(audio);
function updateHeight() {
  // 获取音频频谱数据，每个元素对应一个频率的振幅
  const frequencyData = audioAnalyser.getFrequencyData();

  // 每 50 个频率为一组求和，将 ~1024 个频率压缩为 ~21 个值，对应 21 个圆环
  const sumArr = _.map(_.chunk(frequencyData, 50), (arr) => {
    return _.sum(arr);
  }).reverse();
  console.log(sumArr);

  for (let i = 0; i < analyser.children.length; i++) {
    const mesh = analyser.children[i];
    // 除以 4000 将振幅映射到合理范围，Z 轴是挤出方向（经 group.rotateX 后变为世界 +Y 高度方向）
    const height = sumArr[i] / 5000;
    // mesh.scale 是在 mesh 自己的局部空间里生效的，父级 group 的旋转管不到它
    mesh.scale.z = height;
  }
}

// 更新歌词位置
function updateLyricPosition() {
  // audio.context.currentTime 是错的。 它不是音频播放时间，而是 AudioContext 从页面初始化就开始跑的时钟。
  // audio.context.currentTime - audio._startedAt + audio._progress
  // AudioContext 时钟 - 音频开始时间 + 音频播放时间 = 本次播放经过的时间
  if (lyricPositions.length && audio.isPlaying) {
    // const mSeconds = Math.floor(audio.context.currentTime * 1000);
    const mSeconds =
      (audio.context.currentTime - audio._startedAt + audio._progress) * 1000;
    // console.log(mSeconds,lyricPositions[i][0],lyricPositions[i + 1][0]);
    if (i >= lyricPositions.length - 1) {
      lyricList.position.z = lyricPositions[lyricPositions.length - 1][1];
    } else if (
      mSeconds > lyricPositions[i][0] &&
      mSeconds < lyricPositions[i + 1][0]
    ) {
      // 创建补间动画，lyricList 平滑滚动到下一句歌词的位置，300ms 缓动
      const tween = new Tween(lyricList.position)
        .to({ z: lyricPositions[i][1] + 300 }, 300)
        .easing(Easing.Quadratic.InOut)
        .repeat(0)
        .start()
        .onComplete(() => {
          tweenGroup.remove(tween); // 动画完成后从组中移除，释放引用
        });
      tweenGroup.add(tween);
      i++;
    }
  }

  // 驱动所有活跃的 tween 更新（Tween.js 必须每帧手动调用 update）
  tweenGroup.update();
}

let i = 0;
// tweenGroup 统一管理所有歌词滚动补间动画：
// 1. 生命周期管理：add 添加正在运行的 tween，onComplete 时 remove 清理，避免内存泄漏
// 2. 集中更新：调用一次 tweenGroup.update() 即可驱动所有活跃的 tween
const tweenGroup = new Group();
function render() {
  updateLyricPosition();
  updateHeight();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// 点击事件
const playerBtn = player.getObjectByName("playBtn");
const pauseBtn = player.getObjectByName("pauseBtn");
renderer.domElement.addEventListener("click", (e) => {
  const y = -((e.offsetY / height) * 2 - 1);
  const x = (e.offsetX / width) * 2 - 1;

  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

  const intersections = rayCaster.intersectObjects(player.children);

  if (intersections.length) {
    const obj = intersections[0].object.target;
    if (obj) {
      // 点击按钮的时候，让另一个按钮弹起
      if (obj.name === "playBtn") {
        obj.scale.y = 0.6;
        // 整体少了0.4,中心位置只用减少一半
        obj.position.y = (-80 * 0.4) / 2;

        pauseBtn.scale.y = 1;
        pauseBtn.position.y = 0;
        // buffer 还没加载完 → 记住意图，加载完自动播
        if (!audio.buffer) {
          pendingPlay = true;
          return;
        }
        // buffer 已就绪 → 恢复 AudioContext 后播放
        audio.context.resume().then(() => audio.play());
      } else if (obj.name === "pauseBtn") {
        obj.scale.y = 0.6;
        obj.position.y = (-80 * 0.4) / 2;

        playerBtn.scale.y = 1;
        playerBtn.position.y = 0;
        audio.pause();
      }
    }
  }
});
