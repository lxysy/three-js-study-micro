# Vector Dot — 相机朝向与法线可见性

一个 Three.js 示例，演示如何使用向量**点积**判断相机朝向与物体法线的关系，动态隐藏背对相机的面。

## 核心逻辑

### 1. 获取相机朝向

```ts
const dir = camera.getWorldDirection(new THREE.Vector3());
```

- 返回一个**单位向量**，指向相机在世界空间中的正前方。
- 传入 `new THREE.Vector3()` 作为输出容器，是 Three.js 的**写入模式（write pattern）**，避免在动画循环中反复创建垃圾对象。

### 2. 点积（Dot Product）判断朝向

```ts
if (dir.dot(normal) > 0) {
  // 法线朝向与相机方向夹角 < 90° → 背对相机 → 隐藏
  mesh.children[index].visible = false;
} else {
  // 法线朝向相机 → 显示
  mesh.children[index].visible = true;
}
```

#### 数学原理

点积的公式为：

```math
a · b = |a| |b| cos(θ)
```

本例中 `dir` 和 `normal` 都是**单位向量**（长度为 1），所以简化为：

```math
dir · normal = cos(θ)
```

其中 θ 是两个向量之间的夹角。

由于 `dir.dot(normal) > 0` 等价于 `cos(θ) > 0`，所以：

| 点积结果 | 夹角 θ | 几何含义 | 可见性 |
| --- | --- | --- | --- |
| `> 0` | θ < 90° | 法线指向与相机同侧（背对相机） | 隐藏 |
| `=== 0` | θ = 90° | 互相垂直（恰好侧面） | 显示 |
| `< 0` | θ > 90° | 法线指向与相机异侧（面向相机） | 显示 |

#### 点积在图形学中的常见用途

| 应用 | 说明 |
| --- | --- |
| **光照计算** | 计算光线方向与表面法线的点积，决定漫反射亮度（Lambert 模型） |
| **可见性/背面剔除** | 如本例，判断面是否朝向相机 |
| **向量投影** | 将一个向量投影到另一个方向上的分量长度 |
| **相似度判断** | 点积越大，两向量方向越一致 |
| **前后判断** | 判断一个物体在另一个物体的前面还是后面 |

### 3. 效果

相机旋转时每一帧重新计算，动态隐藏不可见的面，减少 GPU 绘制调用。

## 关于法线的两种概念

### 几何法线（Geometry Normals）

用于**光照计算**，决定光线如何与表面交互。

| 来源 | 是否需要手动处理 |
| --- | --- |
| `BoxGeometry`、`SphereGeometry`、`CylinderGeometry` 等内置几何体 | **自动生成**，开箱即用 |
| GLTF/OBJ 等 3D 文件加载的模型 | 文件自带，Three.js 直接读取 |
| 手写的 `BufferGeometry` | 需要调用 `geometry.computeVertexNormals()` 或手动赋值 |

### 朝向法线（Orientation Normals，业务层）

用于**场景语义判断**，例如本例中每面墙在世界空间的朝向。

- Three.js 不知道你的房子有几面墙、哪面朝哪。
- 这部分**必须自己定义**，属于开发者对场景结构的理解。

本例中：

```ts
export const normals = [
  new THREE.Vector3(0, 0, -1),  // 前墙朝 -Z
  new THREE.Vector3(-1, 0, 0),  // 右墙朝 -X
  new THREE.Vector3(0, 0, 1),   // 后墙朝 +Z
  new THREE.Vector3(1, 0, 0),   // 左墙朝 +X
]
```

这些不是几何顶点法线（光照不受影响），而是用于可见性判断的**业务数据**。

## 关键文件

- [main.ts](src/main.ts) — 渲染循环、点积判断、相机朝向获取
- [mesh2.ts](src/mesh2.ts) — 房子模型（四面墙）及法线定义

## 相关 API

- [`Object3D.getWorldDirection()`](https://threejs.org/docs/#api/en/core/Object3D.getWorldDirection) — 获取对象在世界空间的朝向向量
- [`Vector3.dot()`](https://threejs.org/docs/#api/en/math/Vector3.dot) — 计算两个向量的点积
- [`BufferGeometry.computeVertexNormals()`](https://threejs.org/docs/#api/en/core/BufferGeometry.computeVertexNormals) — 为自定义几何体计算法线
