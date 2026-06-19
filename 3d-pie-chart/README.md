# 3D 饼图 (3D Pie Chart)

基于 Three.js 的交互式 3D 饼图可视化项目，支持扇形分离动画、标签展示和鼠标交互。

## 实现思路

### 1. 扇形几何体生成

每个扇形通过以下步骤生成：

1. **构建闭合路径**：使用 `CurvePath` 将两条直线（`LineCurve`）和一条圆弧（`EllipseCurve`）按顺序连接，形成扇形的轮廓路径
   - 第一条直线：从圆心到扇形起始半径点
   - 圆弧：从起始角度到结束角度的椭圆弧
   - 第二条直线：从扇形结束半径点回到圆心

2. **生成形状**：从路径上均匀取样 100 个点（`getPoints(100)`），用这些点创建 `Shape` 闭合图形

3. **拉伸成 3D**：使用 `ExtrudeGeometry` 将 2D 的 Shape 沿 Z 轴拉伸一定深度（depth: 100），形成具有厚度的 3D 扇形

4. **随机配色**：从预设颜色数组中随机分配颜色给每个扇形，确保不重复

### 2. 标签系统

标签使用 `Sprite` 实现，原理如下：

- 动态创建 `canvas` 元素绘制文字
- 将 canvas 转为 `CanvasTexture` 纹理
- 使用 `SpriteMaterial` 和 `Sprite` 创建始终面向相机的标签
- 根据扇形中间角度计算标签位置，放置在每个扇形外侧上方（z: 150）
- 为了解决高清屏模糊问题，canvas 的宽高会乘以 `devicePixelRatio`

### 3. 交互与动画

- **射线检测**：使用 `Raycaster` 将鼠标点击坐标转换为归一化设备坐标（NDC），检测与扇形的相交
- **扇形分离动画**：点击某个扇形时，使用 `Tween` 动画将该扇形沿其角度方向向外平移 100 个单位
- **复位动画**：点击新扇形时，所有其他扇形先通过 Tween 动画复位到原点
- **属性绑定**：在 mesh 上自定义 `angle` 属性记录扇形中间角度，用于计算平移方向；通过 `target` 属性确保点击标签时也能正确操作对应的扇形

## 核心 API 用法

### 几何体相关

| API | 用途 |
|-----|------|
| `THREE.CurvePath` | 组合多条曲线形成完整路径 |
| `THREE.LineCurve(v1, v2)` | 创建两点之间的直线 |
| `THREE.EllipseCurve(a, b, xRadius, yRadius, startAngle, endAngle)` | 创建椭圆弧，这里用作圆的圆弧 |
| `THREE.Shape(points)` | 根据点数组创建可填充的 2D 形状 |
| `THREE.ExtrudeGeometry(shape, { depth })` | 将 2D 形状拉伸为 3D 几何体 |

### 材质与网格

| API | 用途 |
|-----|------|
| `THREE.MeshPhongMaterial` | 具有镜面高光反射的材质，适合受光照影响的物体 |
| `THREE.Mesh(geometry, material)` | 创建网格模型 |
| `THREE.Group` | 将多个网格组合在一起，统一控制 |

### 标签相关

| API | 用途 |
|-----|------|
| `THREE.CanvasTexture(canvas)` | 将 canvas 转换为 Three.js 纹理 |
| `THREE.SpriteMaterial({ map })` | 使用纹理创建精灵材质 |
| `THREE.Sprite(material)` | 创建始终面向相机的平面，用于显示标签 |

### 场景与渲染

| API | 用途 |
|-----|------|
| `THREE.Scene` | 场景容器 |
| `THREE.PerspectiveCamera(fov, aspect, near, far)` | 透视相机 |
| `THREE.WebGLRenderer` | WebGL 渲染器 |
| `THREE.DirectionalLight` | 平行光，模拟太阳光 |
| `THREE.AmbientLight` | 环境光，提供基础照明 |
| `THREE.AxesHelper(size)` | 坐标轴辅助线 |

### 交互与控制

| API | 用途 |
|-----|------|
| `OrbitControls(camera, domElement)` | 轨道控制器，支持鼠标拖拽旋转、滚轮缩放 |
| `THREE.Raycaster` | 射线投射器，用于检测鼠标点击的 3D 对象 |
| `rayCaster.setFromCamera(vector2, camera)` | 从相机和鼠标位置发射射线 |
| `rayCaster.intersectObjects(objects)` | 检测射线与对象的相交 |

### 动画

| API | 用途 |
|-----|------|
| `Tween(object)` | 创建补间动画 |
| `.to(target, duration)` | 设置动画目标状态 |
| `.easing(Easing.Quadratic.InOut)` | 设置缓动函数 |
| `.onComplete(callback)` | 动画完成回调 |

## 运行环境要求

### 开发环境

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0

### 浏览器支持

需要支持 WebGL 的现代浏览器：

- Chrome / Edge >= 90
- Firefox >= 88
- Safari >= 14

### 项目依赖

| 包名 | 版本 | 说明 |
|------|------|------|
| `three` | ^0.176.0 | Three.js 核心库 |
| `vite` | ^6.3.1 | 构建工具 |
| `@types/three` | ^0.176.0 | Three.js 类型定义 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
.
├── index.html          # 入口 HTML
├── package.json        # 项目配置
├── src/
│   ├── main.js         # 场景初始化、渲染循环、交互逻辑
│   ├── mesh.js         # 3D 饼图生成逻辑
│   ├── label.js        # 标签（Sprite）创建
│   └── style.css       # 全局样式
└── public/             # 静态资源
```

## 数据格式

在 `src/mesh.js` 中修改 `data` 数组来配置饼图数据：

```js
const data = [
  { name: "春节销售额", value: 1000 },
  { name: "夏节销售额", value: 3000 },
  { name: "秋节销售额", value: 800 },
  { name: "冬节销售额", value: 500 },
];
```
