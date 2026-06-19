## ADDED Requirements

### Requirement: 自动扫描目录
系统 SHALL 提供脚本自动扫描项目目录，识别所有 demo 子项目。

#### Scenario: 扫描所有 demo
- **WHEN** 运行扫描脚本
- **THEN** 脚本遍历根目录下所有子目录
- **THEN** 排除 `node_modules`、`openspec`、`scripts`、`src`、`public`、`dist` 等非 demo 目录
- **THEN** 识别每个 demo 的类型（Type A importmap / Type B vite）

### Requirement: 生成注册表
系统 SHALL 输出一个 JSON 注册表文件，包含所有 demo 的元数据。

#### Scenario: 注册表内容
- **WHEN** 扫描完成
- **THEN** 生成 `src/registry/demos.json` 文件
- **THEN** 每条记录包含：name、title、type（'importmap'|'vite'|'vite-react'）、category、threeVersion、description、hasPublicAssets

### Requirement: 手动补充元数据
系统 SHALL 支持通过一个配置文件手动补充和覆盖自动识别的元数据。

#### Scenario: 补充描述和分类
- **WHEN** `scripts/demo-meta.json` 中存在对应 demo 的配置
- **THEN** 自动识别的元数据与手动配置合并，手动配置优先
