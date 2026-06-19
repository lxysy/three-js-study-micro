## ADDED Requirements

### Requirement: 左侧分类导航栏
系统 SHALL 提供一个左侧导航栏，列出所有可查看的 demo。

#### Scenario: 显示所有 demo 列表
- **WHEN** 用户打开主页面
- **THEN** 左侧导航栏显示所有 demo 的列表

#### Scenario: demo 按分类分组
- **WHEN** 导航栏渲染完成
- **THEN** demo 按分类（基础篇 / 进阶篇 / 动画与应用 / 3D效果 / 交互与标注 / React 集成）分组显示
- **THEN** 每个分类组可折叠/展开

### Requirement: 搜索过滤
系统 SHALL 提供搜索框，可实时过滤 demo 列表。

#### Scenario: 搜索 demo 名称
- **WHEN** 用户在搜索框中输入关键字
- **THEN** demo 列表实时过滤，只显示名称包含关键字的 demo
- **THEN** 匹配的内容高亮显示

#### Scenario: 搜索无结果
- **WHEN** 用户输入的关键字不匹配任何 demo
- **THEN** 显示"未找到匹配的 demo"提示

### Requirement: 激活状态指示
系统 SHALL 在导航栏中高亮当前正在查看的 demo。

#### Scenario: 点击切换高亮
- **WHEN** 用户点击导航栏中的某个 demo
- **THEN** 该 demo 在导航栏中处于高亮状态
- **THEN** URL 的 hash 更新为 `#/<demo-name>`
