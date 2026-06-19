## ADDED Requirements

### Requirement: 按分类抽样测试
系统 SHALL 使用 Playwright 对 demo 进行 E2E 测试，按分类抽样覆盖。

#### Scenario: 测试覆盖范围
- **WHEN** 运行 `npm run test:e2e`
- **THEN** 至少测试以下 demo（覆盖所有类型和分类）：
  - Type A importmap：first-scene、tube-travel
  - Type B vite：all-controls、snowy-forest
  - Type B React：threejs-editor、react-three-app
  - 大资源项目：cube-camera-envmap（HDR）、bone-animation（模型动画）
- **THEN** 总计不少于 8 个 demo 被测试

### Requirement: 加载验证
系统 SHALL 验证每个 demo 是否能正常加载和渲染。

#### Scenario: 验证 demo 加载
- **WHEN** Playwright 导航到指定 demo 的 URL
- **THEN** 等待 iframe 加载完成
- **THEN** 验证页面未出现错误提示
- **THEN** 验证 Three.js canvas 元素存在且非零尺寸

### Requirement: 导航切换测试
系统 SHALL 验证导航栏切换 demo 的功能正常。

#### Scenario: 切换 demo
- **WHEN** Playwright 通过侧边栏选择第一个 demo
- **THEN** 验证对应的子应用成功加载
- **WHEN** 选择第二个 demo
- **THEN** 验证第一个子应用被卸载
- **THEN** 验证第二个子应用成功加载
