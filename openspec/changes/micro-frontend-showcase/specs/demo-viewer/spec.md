## ADDED Requirements

### Requirement: iframe 子应用容器
系统 SHALL 提供一个容器组件，通过 micro-app 的 iframe 模式加载子应用。

#### Scenario: 成功加载子应用
- **WHEN** 用户从导航栏选择一个 demo
- **THEN** 容器组件创建 `<micro-app iframe>` 并指向该 demo 的 URL
- **THEN** 子应用在 iframe 中正常渲染

#### Scenario: 切换子应用
- **WHEN** 用户从导航栏选择另一个 demo
- **THEN** 前一个子应用被卸载（iframe 销毁，WebGL context 释放）
- **THEN** 新子应用开始加载

### Requirement: 加载状态
容器 SHALL 在子应用加载过程中显示加载状态。

#### Scenario: 显示加载提示
- **WHEN** 子应用正在加载
- **THEN** 容器显示加载动画或提示文字

#### Scenario: 加载完成
- **WHEN** 子应用加载完成
- **THEN** 加载状态消失，显示子应用内容

### Requirement: 错误处理
容器 SHALL 在子应用加载失败时显示错误提示。

#### Scenario: 加载失败显示重试
- **WHEN** 子应用加载失败（网络错误、资源 404 等）
- **THEN** 容器显示错误提示和"重试"按钮
- **WHEN** 用户点击"重试"
- **THEN** 容器重新加载该子应用
