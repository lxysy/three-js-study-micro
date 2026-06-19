## 1. Fix build-type-a.js — copy all asset files

- [x] 1.1 修改 `scripts/build-type-a.js` 中 `buildDemo` 函数的文件复制逻辑：不再仅复制 `.js`/`.css`，改为复制所有文件（排除 `package.json`、`package-lock.json`、`node_modules`、`.gitignore`）
- [x] 1.2 确保子目录中的文件也被递归复制（如 `gltf1/`、`gltf2/` 等多级目录结构）
- [x] 1.3 重新构建 Type A demo（`npm run build:type-a`），验证 `Horse.gltf`、`model.glb` 等文件出现在 `public/demos/<name>/` 中

## 2. Fix gltf-structure — move model files to public/

- [x] 2.1 将 `gltf-structure/gltf1/`、`gltf-structure/gltf2/`、`gltf-structure/gltf3/` 移动到 `gltf-structure/public/` 下
- [x] 2.2 保持 `gltf-structure/src/mesh.js` 中的相对路径 `./gltf1/CesiumMan.gltf`（移动模型到 public/ 后，Vite 会将 public/ 内容复制到输出根目录，相对路径即可正确解析；绝对路径 `/gltf1/` 在 DEMO 嵌套于 `/demos/gltf-structure/` 路径下时会指向错误的服务器根目录）
- [x] 2.3 重新构建 gltf-structure（`npm run build:type-b` 或单独构建），验证模型文件出现在输出中

## 3. E2E — add console error assertions

- [x] 3.1 在 `e2e/demos.spec.js` 中为每个 demo 测试添加 `pageerror` 和 `console.error` 收集逻辑
- [x] 3.2 在 canvas 断言之后增加 `expect(errors).toEqual([])` 断言
- [x] 3.3 添加白名单过滤：css3d-computer 的外部 CORS 错误（`sogou.com`、`qq.com`）不计入失败
- [x] 3.4 运行全量 e2e 测试，确认所有 61 个 demo 的 console error 断言通过

## 4. Build and final verification

- [x] 4.1 运行 `npm run build` 完整构建
- [x] 4.2 运行 `npm run test:e2e -- --project=chrome` 验证全部通过
- [x] 4.3 手动抽查 gltf-model、gltf-pipeline-test、gltf-structure 确认模型正常加载
