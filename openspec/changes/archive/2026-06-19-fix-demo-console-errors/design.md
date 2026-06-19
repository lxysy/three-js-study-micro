## Context

当前 61 个 demo 的构建流程中，Type A（importmap）demo 通过 `build-type-a.js` 将源文件复制到 `public/demos/<name>/`，Type B（vite）demo 通过各自的 `vite build` 输出到同一目录。e2e 测试验证了 canvas 渲染，但未捕获控制台错误。

全量扫描发现：
- 3 个 demo 因为 GLTF/GLB 模型文件未被复制而报 JSON 解析错误
- 1 个 demo 有 favicon 404（非关键）
- 1 个 demo（css3d-computer）有外部 tracker CORS 错误（非 demo 代码问题）

## Goals / Non-Goals

**Goals:**
- 修复构建脚本，确保所有 demo 资源文件（JS/CSS/GLTF/GLB/BIN/图片）被正确部署
- 修复 gltf-structure 的模型文件路径问题
- e2e 测试增加控制台错误断言，防止未来回归
- 最终目标：所有 61 个 demo 加载时 0 控制台错误（外部 tracker 除外）

**Non-Goals:**
- 不修复 css3d-computer 的外部 tracker CORS 错误（来自 sogou.com/qq.com 的外部脚本，非 demo 自身代码）
- 不修改 Three.js 源码或 GLTFLoader 行为
- 不改变 demo 的业务逻辑

## Decisions

### 决策 1：build-type-a.js — 复制所有文件而非仅 JS/CSS

当前逻辑：
```js
// 仅复制 *.js 和 *.css
if (item.endsWith('.js') || item.endsWith('.css')) {
  cpSync(...)
}
```

问题：`Horse.gltf`、`Horse.bin`、`model.glb` 等模型文件以原始格式存在于源目录根级别，不在 `public/` 子目录中。构建脚本过滤掉它们。

**修复方案**：移除文件扩展名过滤，复制源目录中所有非目录文件。同时排除 `package.json`、`node_modules`、`.gitignore` 等构建无关文件。

### 决策 2：gltf-structure — 移动模型文件到 public/ 目录

gltf-structure（Type B vite）的模型文件在项目根目录 `gltf1/`、`gltf2/`、`gltf3/`，但 `src/mesh.js` 中用相对路径 `./gltf1/CesiumMan.gltf` 引用。Vite 的 GLTFLoader 字符串路径不会被 Vite 的资源处理管线追踪。

**修复方案**：将 `gltf1/`、`gltf2/`、`gltf3/` 移动到 `public/` 目录下，并更新 `src/mesh.js` 中的路径为绝对路径 `/gltf1/CesiumMan.gltf` 等。Vite 构建时会将 `public/` 目录下的文件原样复制到输出目录。

### 决策 3：e2e 控制台错误断言

当前测试只检查 canvas 存在性：
```js
expect(await waitForCanvas(page, timeout)).toBeTruthy()
```

**修复方案**：在每个 demo 测试中：
1. 注册 `page.on('pageerror')` 监听器收集未捕获异常
2. 注册 `page.on('console')` 监听器收集 `console.error` 调用
3. 页面加载后断言错误列表为空

```js
const errors = []
page.on('pageerror', err => errors.push(err.message))
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

await page.goto(...)
await page.waitForTimeout(3000)

expect(errors, `Console errors: ${errors.join('; ')}`).toEqual([])
```

**外部噪音处理**：css3d-computer 的外部 CORS 错误通过白名单过滤（匹配 `sogou.com`、`qq.com` 等外部域名的错误不计入失败）。

### 决策 4：css3d-computer 的 CORS 错误 — 不修复

css3d-computer 的 CORS 错误来自 `https://hotlist.imtt.qq.com/GetRefreshInterval` 和 `https://sogou.com`，这些是外部 tracker/广告脚本。这不是 demo 自身代码产生的问题，不在修复范围内。在 e2e 断言中白名单过滤。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 复制所有文件可能包含不需要的文件（如 .gitignore, package.json） | 添加排除列表：`package.json`, `package-lock.json`, `node_modules`, `.gitignore` |
| gltf-structure 路径变更可能影响 Vite dev 模式 | 使用绝对路径 `/gltf1/...` 在 dev 和 build 模式下均能正确解析（Vite 的 public 目录在 dev 模式下也以 `/` 提供） |
| e2e 白名单可能遗漏某些外部错误 | 白名单仅用于已知的外部 tracker URL，新的外部错误需要人工审查后决定是否加入 |
