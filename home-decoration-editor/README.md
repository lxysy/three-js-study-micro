# 装修编辑器 — Three.js 旋转顺序说明

## 三种旋转方式的先后顺序

Three.js 提供两种修改物体旋转的 API，它们有着完全不同的语义，**混用时会非常容易出错**。

---

### 一、`rotation`（Euler 角）

```ts
mesh.rotation.set(x, y, z);    // 同时设置三个轴
mesh.rotation.y = Math.PI;     // 单独设置某一轴
```

**默认顺序：XYZ**（由 `mesh.rotation.order` 控制，可改为 YXZ / ZYX 等）。

顶点变换矩阵 = **Rz × Ry × Rx**（从右往左读：先绕 X 转，再绕 Y 转，最后绕 Z 转）。

```ts
mesh.rotation.x = a;
mesh.rotation.y = b;
mesh.rotation.z = c;
// v' = Rz(c) × Ry(b) × Rx(a) × v
// 先转 X，再转 Y，最后转 Z
```

`rotation` 是**声明式**的：设置后直接覆盖对应欧拉角，**不会累加**。第二次 `rotation.y = PI` 会直接覆盖第一次的值。

---

### 二、`rotateX` / `rotateY` / `rotateZ`（四元数后乘）

```ts
mesh.rotateX(-Math.PI / 2);
mesh.rotateY(Math.PI);
```

**后乘（post-multiply）**：每次调用在**当前 quaternion 右侧**乘上新旋转。

**口诀：代码中越靠后的 `rotate` 调用，越先作用到顶点。**

```ts
mesh.rotateX(-Math.PI / 2);    // 第①步
mesh.rotateY(Math.PI);         // 第②步
// 最终 Q = Q_x(-PI/2) × Q_y(PI)
// 顶点变换：v' = Rx(-PI/2) × Ry(PI) × v
// Ry(PI) 在矩阵最右侧 → 最先作用到顶点
// Rx(-PI/2) 在矩阵最左侧 → 最后作用到顶点
// 作用顺序：先 rotateY(PI)，再 rotateX(-PI/2)
```

与 `rotation` 不同，`rotateX/Y/Z` 是**过程式**的：每次调用都会累加到现有 quaternion 上。

---

### 三、混用 `rotation.y =` + `rotateX` / `rotateY`（当前代码的写法）

```ts
wall.rotation.y = item.rotationY;   // ① 设置欧拉角 → 生成 Q0
wall.rotateX(-Math.PI / 2);         // ② Q = Q0 × Qx
wall.rotateY(Math.PI);              // ③ Q = Q0 × Qx × Qy
```

**这里的 `rotation.y =` 会先通过欧拉角生成一个初始 quaternion Q0，然后 `rotateX/Y` 在其基础上后乘。**

最终 quaternion：**Q = Q_y(rotationY) × Q_x(-PI/2) × Q_y(PI)**

顶点变换（把矩阵从右往左读就是实际作用顺序）：

```text
v' =  Ry(rotationY)  ×   Rx(-PI/2)  ×   Ry(PI)  ×  v
     ↑ ① 代码最先写      ↑ ② 代码中间写    ↑ ③ 代码最后写
       最后作用到顶点        中间作用到顶点     最先作用到顶点
```

**实际作用到顶点的顺序（从先到后）：**

1. `rotateY(Math.PI)` ← 代码③最后写，**最先转**
2. `rotateX(-PI/2)` ← 代码②中间写
3. `rotation.y = item.rotationY` ← 代码①最先写，**最后转**

> **这就是混用最容易搞混的地方：代码理解是正序（①→②→③），但顶点作用却是倒序（③→②→①）。**

---

### 四、推荐写法

#### 方案 A：全用 `rotation`（Euler）— 推荐

```ts
// 直观且不会搞混
wall.rotation.set(
  -Math.PI / 2,                 // x：放平到地面
  (item.rotationY ?? 0) + Math.PI,  // y：方向 + 可选的 180° 翻转
  0                             // z
);
```

**优点**：声明式、不累加、顺序由 `order` 属性明确控制、容易推理。

#### 方案 B：全用 `rotate`（quaternion 后乘）

```ts
// 所有旋转统一用 rotate 方法，不要混用 rotation.y =
wall.rotateX(-Math.PI / 2);
wall.rotateY(item.rotationY ?? 0);
// 如需额外翻转 180°，再接一个 rotateY：
// wall.rotateY(Math.PI);
// 注意：上面两行 rotateY 会累加，实际效果是 Y 方向旋转了 (item.rotationY + PI)
```

**优点**：适合链式调用、与矩阵层级变换的思维一致。
**注意**：`rotate` 会累加，第二次调用 `rotateY(PI)` 是在第一次 `rotateY(item.rotationY)` 基础上再转 180°。

#### 方案 C：绝对不要

```ts
// ❌ 混用 rotation.y = 和 rotateX/Y
wall.rotation.y = item.rotationY;   // 覆盖所有之前的旋转
wall.rotateX(-Math.PI / 2);         // 在 rotation.y 基础上后乘
// 到底先转 X 还是先转 Y？很难一眼看出来
```

---

### 五、总结对照表

| 方式 | 累加？ | 代码顺序 vs 顶点作用顺序 | 推荐场景 |
| --- | --- | --- | --- |
| `rotation.set()` | 不累加，直接覆盖 | 按 `order` 属性（默认 XYZ）：`Rz × Ry × Rx` | **日常最推荐** |
| `rotateX/Y/Z()` | 累加 | **逆序**：代码越靠后，顶点越先转 | 链式变换、增量旋转 |
| `rotation.y =` + `rotateX` | 混用 | 容易搞混，需要逐层推理 quaternion | **避免使用** |

---

项目相关代码见 [src/components/Main/index.tsx](src/components/Main/index.tsx) 第 294~322 行的 2D 场景墙面创建逻辑。

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
