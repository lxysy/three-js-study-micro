# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## 踩坑记录：拖动 mesh 时 React "Maximum update depth exceeded" 错误

### 问题

拖动已添加到场景的 mesh 时，浏览器报错：

```
Uncaught Error: Maximum update depth exceeded.
at updateMeshPosition (index.js:113:7)
at TransformControls.<anonymous> (init.js:115:7)
```

错误栈显示：TransformControls 的 `"change"` 事件 → `updateMeshPosition` → zustand `setState` → React 同步重新渲染 → 再触发 `setState` → 形成死循环。

### 根因

三个问题叠加导致：

#### 1. 错误的事件类型（`init.js`）

监听的是 TransformControls 的泛型 `"change"` 事件。该事件在以下情况都会触发（源码 `TransformControls.js`）：
- **`pointerMove`** — 每帧拖动时（第 747 行）
- **`defineProperty` setter** — 任何属性变化（`axis`、`mode`、`space`、`object` 等，第 123-124 行），包括鼠标悬停到变换控制器上切换 `axis` 时

而 Three.js 提供了更精确的 `"objectChange"` 事件，**仅在受控 3D 物体的变换实际改变时触发**（第 748 行，与 `"change"` 同时在 `pointerMove` 中派发，但不会在属性变化时派发）。

#### 2. 状态突变（`store/index.js`）

```js
// 问题代码
mesh.props.position = position;  // position 是 transformControls.object.position 的 live 引用
```
- 直接修改了 zustand store 中的现有对象
- 存入了 Three.js `Vector3` 的实时引用，而非纯 `{x, y, z}` 对象
- 破坏了 zustand 的不可变性约定

#### 3. 冗余的 scene.add() 调用（`Main/index.jsx`）

`useEffect([data])` 的回调中对**所有 mesh**（包括已在场景中的）调用了 `scene.add(mesh)`。Three.js 的 `Object3D.add()` 在对象已有父级时会执行 `removeFromParent()`（将 `parent` 置为 `null`）再重新添加。对于正在被 TransformControls 拖动的 mesh，这种父级抖动可能在 React 同步刷新 effect 时触发 Three.js 内部矩阵重算，导致 TransformControls 派发额外事件，形成嵌套更新循环。

### 修复方案

三个修改相互配合，缺一不可：

#### 修改 1：`init.js` — 改用 `"objectChange"` 事件

```js
// 修改前
transformControls.addEventListener("change", () => { ... });

// 修改后
transformControls.addEventListener("objectChange", () => { ... });
```

消除 hover 切换 axis 等非拖动场景触发的 store 更新。

#### 修改 2：`store/index.js` — 不可变更新 + 纯对象存位置

```js
// 修改后
updateMeshPosition(name, position) {
    set((state) => ({
        data: {
            ...state.data,
            meshArr: state.data.meshArr.map((mesh) => {
                if (mesh.name === name) {
                    return {
                        ...mesh,
                        props: {
                            ...mesh.props,
                            position: { x: position.x, y: position.y, z: position.z },
                        },
                    };
                }
                return mesh;
            }),
        },
    }));
},
```

创建全新的 mesh 对象，用纯 `{x, y, z}` 对象存位置而非 Vector3 引用。

#### 修改 3：`Main/index.jsx` — 仅新 mesh 调用 scene.add()

```jsx
// 修改后
let mesh = scene.getObjectByName(item.name);

if (!mesh) {
    // 创建几何体和材质
    mesh = new THREE.Mesh(geometry, material);
    mesh.name = item.name;
    scene.add(mesh);  // 只对新 mesh 调用 add
}

mesh.position.copy(position);  // 已有 mesh 只需更新位置
```

避免对已有 mesh 重复执行 `removeFromParent()` → 重新添加的操作。

#### 修改 4：`init.js` — 使用 rAF 批处理 store 更新（核心修复）

```js
let pendingPos = null;
let pendingName = null;
let rafId = null;

transformControls.addEventListener("objectChange", () => {
    const obj = transformControls.object;
    if (!obj) return;

    if (!pendingPos) {
        pendingPos = {};
        pendingName = obj.name;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            const p = pendingPos;
            const n = pendingName;
            pendingPos = null;
            pendingName = null;
            updateMeshPosition(n, p);
        });
    }
    pendingPos.x = obj.position.x;
    pendingPos.y = obj.position.y;
    pendingPos.z = obj.position.z;
});
```

**实现原理（核心设计）：**

这段代码实现了一个 **"每帧只更新一次"** 的批处理机制，通过三个闭包变量协作：

```
变量                      作用
─────────────────────────────────────────────
pendingPos = null        最新的位置缓存（纯 {x,y,z} 对象）
pendingName = null       最新的 mesh 名称
rafId = null             rAF 的 ID，用于判断是否已调度
```

**执行流程：**

```
Frame N:
  1. pointerMove → "objectChange" 事件触发
  2. pendingPos 为 null → 创建空对象 {}、记录名称、调度 rAF
  3. pendingPos.x/y/z = obj.position 最新值
  4. pointerMove → "objectChange" 再次触发
  5. pendingPos 不为 null → 跳过 rAF 调度，仅更新 x/y/z
  
Frame N+1 (下一帧浏览器渲染前):
  6. rAF 回调执行
  7. 从 pendingPos/pendingName 读取最终值
  8. 清空 pending 变量（允许下一轮新调度）
  9. 调用 updateMeshPosition(name, {x, y, z})
```

**关键设计要点：**

1. **`pendingPos` 双重身份** — 既是"是否已调度 rAF"的标记（null / 非 null），也是实际的数据缓存。避免了额外布尔变量。

2. **`requestAnimationFrame` 的天然合并** — rAF 在一帧内只会被调用一次。即使 `"objectChange"` 在一帧内触发了 100 次，也只调度**一个** rAF 回调，100 次中的最后一次位置值会被保留。

3. **值捕获而非引用捕获** — 在每次 `"objectChange"` 中将 `obj.position.x` 的数值（primitive）存入 `pendingPos.x`，而非保存 `obj.position` 的 Vector3 引用。即使后续事件修改了 Vector3，已存入的值不受影响。

4. **恢复变量用于下一轮** — rAF 回调执行后将 `pendingPos = null` 和 `pendingName = null`，允许下一次 `"objectChange"` 重新开始一轮调度。

**为什么这样能彻底解决问题？**

修改前，每次 `"objectChange"` 的同步调用链是：

```
THREE.EventDispatcher.dispatchEvent() 
  → 我们的 "objectChange" 监听器
    → updateMeshPosition(obj.name, obj.position)   // 同步调用 zustand setState
      → zustand listeners.forEach
        → React useSyncExternalStore → forceStoreRerender
          → Main 组件同步重渲染
            → useEffect([data]) 同步执行
              → mesh.position.copy(position)        // 修改 THREE.js 状态
                → ??? 可能触发更多事件 ???           // 循环的根源
```

修改后，同步调用链被切断：

```
THREE.EventDispatcher.dispatchEvent() 
  → 我们的 "objectChange" 监听器
    → pendingPos.x = obj.position.x    // 只需复制数值，O(1) 操作，几乎无开销
    → 返回                             // 不调用 setState，不触发 React
  → dispatchEvent 正常完成
  → 浏览器处理下一帧
  
下一帧 requestAnimationFrame 回调:
  → updateMeshPosition(name, {x, y, z})  // 此时已完全脱离 THREE.js 事件栈
    → zustand setState
      → React 正常渲染                   // 没有事件循环中的循环条件
```

核心思想是：**不要在三.js 的事件循环里同步调用 React 的 setState**。将所有状态更新推到 `requestAnimationFrame` 回调中执行，此时调用栈已完全脱离 THREE.js 的事件分发系统，React 重渲染中的任何操作都不可能再次触发 TransformControls 的事件，从而彻底切断反馈循环。

### 验证方法

1. 启动应用，添加 Box mesh 到场景
2. 点击 Box 选中（显示轮廓 + 变换控制器）
3. 拖动 Box — 应流畅移动，控制台无报错
4. 添加 Cylinder，同样拖动验证
5. 悬停在变换控制器上但不拖动 — 不应触发 store 更新或 re-render
6. 按 Delete 删除选中的 mesh — 应正常删除
7. 浏览器控制台无报错

---

## 踩坑记录：Delete 删除 mesh 时 "TransformControls: The attached 3D object must be a part of the scene graph"

### 问题

添加 mesh 到场景，选中后按 Delete/Backspace 键删除，控制台报错：

```
installHook.js:1 TransformControls: The attached 3D object must be a part of the scene graph
```

### 根因

TransformControls 内部的 `updateMatrixWorld()` 会检查 `attach()` 的对象是否仍在场景图（scene graph）中。按下 Delete 时的执行顺序是：

1. `sceneRef.current.remove(selectedObj)` — 先从场景中移除 mesh
2. `removeMesh(selectedObj.name)` — 再从 store 中移除

但 TransformControls 仍然持有该 mesh 的引用（之前点击选中时 `transformControls.attach(obj)` 绑定的），移除后 TransformControls 做内部更新时发现 object 不在场景图中，于是抛出 warning。

**根本原因：删除了场景中的 mesh，却没有先告诉 TransformControls 释放它。**

### 修复方案

两个修改，核心是在删除 mesh **之前**先调用 `transformControls.detach()`。

#### 修改 1：`init.js` — 暴露 transformControls 给外部

```js
// 修改前
return {
  scene,
};

// 修改后
return {
  scene,
  transformControls,  // 让 Main 组件可以访问 transformControls 实例
};
```

#### 修改 2：`Main/index.jsx` — 删除前先 detach

```jsx
// 新增 ref 保存 transformControls
const transformControlsRef = useRef();

// 初始化时获取 transformControls
const { scene, transformControls } = init(dom, data, onSelected, updateMeshPosition);
transformControlsRef.current = transformControls;

// 删除 keydown 处理：先 detach 再 remove
function handleKeydown(e) {
  if (e.key === "Backspace" || e.key === "Delete") {
    transformControlsRef.current.detach();  // ★ 先释放 TransformControls
    sceneRef.current.remove(selectedObj);    // 再移除场景对象
    removeMesh(selectedObj.name);            // 最后更新 store
  }
}
```

**关键点：顺序至关重要。必须先 `detach()` 再 `remove()`，反之则报错。**

### 验证方法

1. 添加 Box mesh 到场景
2. 点击选中（显示轮廓 + 变换控制器）
3. 按 Delete 删除 — mesh 正常消失，控制台无报错
4. 连续添加 / 删除多个 mesh 验证
5. 点击场景空白处取消选中后再删除（应无操作）
6. 浏览器控制台始终无报错

---

## 踩坑记录：`mesh.rotation.copy(rotation)` 旋转不生效

### 问题

store 中的 `rotation` 是普通对象 `{ x: 0, y: 0, z: 0 }`，调用 `mesh.rotation.copy(rotation)` 后旋转不生效。

### 根因

Three.js 的 `Euler.copy()` 直接读取源对象的**私有下划线属性**（`_x`、`_y`、`_z`、`_order`），而非通过公共 getter：

```js
// three/src/math/Euler.js
copy(euler) {
    this._x = euler._x;      // 普通对象无 _x → undefined
    this._y = euler._y;      // 普通对象无 _y → undefined
    this._z = euler._z;      // 普通对象无 _z → undefined
    this._order = euler._order; // 普通对象无 _order → undefined
    this._onChangeCallback();
    return this;
}
```

传播链：`_order = undefined` → `onRotationChange` → `Quaternion.setFromEuler` 读 `euler._x/_y/_z/_order` 全为 `undefined` → `Math.cos(undefined)` = `NaN` → `switch(order)` 匹配不到任何有效 case → 四元数充满 `NaN` → 矩阵计算失败。

作为对比，`Vector3.copy()` 读取的是公共属性 `v.x`/`v.y`/`v.z`，所以 `position.copy()` 和 `scale.copy()` 正常工作。

### 修复方案

改用 `Euler.set()` 替代 `copy()`：

```js
// ❌ 不工作：接收普通对象，copy 读 _x/_y/_z/_order
mesh.rotation.copy(rotation);

// ✅ 正常工作：接收原始数值
mesh.rotation.set(rotation.x, rotation.y, rotation.z);
```

`Euler.set()` 的实现也直接写私有字段，但它接收的是原始 `(x, y, z)` 数值参数，不存在"从源对象读取错误属性"的问题。

### 验证方法

1. 添加一个 Box mesh，用 TransformControls 旋转它
2. 观察 mesh 在场景中正常旋转
3. 控制台无报错

---

## 踩坑记录：Zustand store 中的可变操作

### 问题

`store/index.js` 中 `updateMeshInfo` 对 position 和 scale 的赋值直接修改了原 mesh 对象的 props：

```js
// ❌ 直接篡改原对象
mesh.props.position = info;
mesh.props.scale = info;
```

虽然 `map()` 返回新数组、`data` 通过 spread 创建了新对象不阻碍触发重渲染，但直接修改原对象的 props 不符合不可变更新原则，可能导致未来依赖对象引用的优化（如 `React.memo`、`useSelector` 浅比较）失效。

### 修复方案

改为创建新对象：

```js
// ✅ 创建新对象
mesh.props.position = { x: info.x, y: info.y, z: info.z };
mesh.props.scale = { x: info.x, y: info.y, z: info.z };
```

### 验证方法

1. 添加 mesh 到场景
2. 用 TransformControls 拖动/缩放/旋转
3. 操作流畅，控制台无报错

---

## 踩坑记录：TransformControls 事件冲突导致重复写入循环

### 问题

拖动 TransformControls 旋转 mesh 时，`init.js` 中同时存在两个事件监听器对 store 进行写入，产生重复写入循环：

```
TransformControls 旋转
  ├─ "objectChange" 事件 → rAF 批处理 → updateMeshInfo (仅 position)
  └─ "change" 事件 → 同步 updateMeshInfo (position/scale/rotation)
                         └─ React 重渲染 → [data] effect
                              └─ mesh.rotation.set() 覆盖实时值
                                   └─ TransformControls 内部控制
```

此外，`"change"` 事件在 TransformControls 的任何属性变化时都会触发（包括 gizmo hover 切换 axis），不适合用于驱动 store 更新。

### 修复方案

- **统一使用 `"objectChange"` 事件**（仅在受控物体变换时触发，不会因 hover 等操作触发）
- **扩展 rAF 批处理**同时处理 position、scale、rotation 三个属性
- **删除重复的 `"change"` 事件监听**

```js
let pendingUpdate = null;
let pendingName = null;
let rafId = null;

transformControls.addEventListener("objectChange", () => {
    const obj = transformControls.object;
    if (!obj) return;

    if (!pendingUpdate) {
        pendingUpdate = {};
        pendingName = obj.name;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            const u = pendingUpdate;
            const n = pendingName;
            pendingUpdate = null;
            pendingName = null;
            if (u.pos !== undefined) updateMeshInfo(n, u.pos, "position");
            if (u.scale !== undefined) updateMeshInfo(n, u.scale, "scale");
            if (u.rot !== undefined) updateMeshInfo(n, u.rot, "rotation");
        });
    }
    pendingUpdate.pos = { x: obj.position.x, y: obj.position.y, z: obj.position.z };
    pendingUpdate.scale = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };
    pendingUpdate.rot = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
});
```

### 验证方法

1. 添加 mesh 到场景
2. 分别用 translate / rotate / scale 模式拖动操控
3. 确认 mesh 实时跟随操控，无卡顿
4. 确认 store 中 position / scale / rotation 正确更新
5. 悬停在变换控制器 axis 上但不拖动 — 不应触发 store 更新
6. 控制台无报错
