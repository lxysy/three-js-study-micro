## Why

上一轮 e2e 测试只验证了 canvas 渲染，未检查浏览器控制台错误。全量扫描 61 个 demo 后发现 4 个 demo 存在 JS 运行时错误（共 5 个有控制台输出，其中 1 个为外部 tracker 脚本的 CORS 报错，非 demo 自身问题）。这些错误的核心原因是构建脚本未将 GLTF/GLB/BIN 等 3D 模型资源文件复制到构建输出目录，导致 GLTFLoader 加载模型时收到 HTML 404 页面而抛出 JSON 解析异常。需要修复构建脚本的资源复制逻辑，并增强 e2e 测试以捕获控制台错误，防止未来回归。

## What Changes

- 修复 `build-type-a.js`：将源目录中所有文件（不仅是 `.js`/`.css`）复制到构建输出，确保 `.gltf`/`.glb`/`.bin` 等模型资源被正确部署
- 修复 `gltf-structure`（Type B vite）：将根目录的 `gltf1/`/`gltf2/`/`gltf3/` 模型目录移动到 `public/` 下，使其被 Vite 构建流程正确处理
- 增强 e2e 测试：每个 demo 测试用例新增浏览器控制台错误断言，`pageerror` 事件和 `console.error` 调用均视为测试失败
- 修复 `buffer-geometry` 的 favicon 404（非关键，但一并消除）

## Capabilities

### New Capabilities

- `console-error-free-demos`: 所有 61 个 demo 在浏览器中加载时 SHALL NOT 产生任何未捕获的 JavaScript 异常（pageerror）或 console.error 调用

### Modified Capabilities

<!-- 无现有 capability 需要修改 -->

## Impact

- **Affected code**: `scripts/build-type-a.js`（资源复制逻辑）、`gltf-structure/`（模型文件位置）、`e2e/demos.spec.js`（新增控制台错误断言）
- **Dependencies**: 无新增依赖
- **Breaking changes**: 无
