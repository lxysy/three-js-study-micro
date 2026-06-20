## Why

threejs-editor 在 shell 暗色主题中运行时，右侧 Properties 面板中的 antd 组件（Segmented、Tree、Form/ColorPicker）以及 Monaco Editor 的文字颜色与背景对比度不足，导致文字难以辨认。根因是 antd 组件跟随系统 `prefers-color-scheme` 自动切换暗色主题，但 demo 自身没有统一管理主题，导致组件内部文字颜色与页面背景、边框颜色产生冲突。不使用现有的 `index.css`（其 CSS 变量体系过于复杂），改为直接在 Properties 面板上做针对性的样式覆盖。

## What Changes

- `App.jsx`：添加 antd `ConfigProvider` + `theme.darkAlgorithm` 统一设置暗色主题算法
- `App.scss`：将硬编码 `border: 1px solid #000` 替换为更柔和的暗色边框，添加 Properties 面板暗色适配样式
- `components/Properties/index.jsx`：Monaco Editor 显式设置 `theme="vs-dark"`
- `components/Properties/info.jsx`：Form.Item label 添加白色文字样式
- 不恢复 `index.css` 的 import（按用户要求保留注释状态）

## Capabilities

### New Capabilities

- `threejs-editor-dark-styles`: threejs-editor 的 Properties 面板在暗色环境下文字清晰可读，antd 组件通过 ConfigProvider 统一主题

### Modified Capabilities

<!-- 无 -->

## Impact

- **Affected files**: `threejs-editor/src/App.jsx`、`threejs-editor/src/App.scss`、`threejs-editor/src/components/Properties/index.jsx`、`threejs-editor/src/components/Properties/info.jsx`
- **Dependencies**: 无新增（antd 已安装）
- **Breaking changes**: 无
