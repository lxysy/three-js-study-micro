# Three.js Editor Dark Styles

**Purpose**: Ensure the threejs-editor demo renders with readable text in dark theme, using antd `ConfigProvider` for unified dark styling.

## Requirements

### Requirement: antd components use unified dark theme

The threejs-editor app SHALL wrap its component tree with antd `ConfigProvider` configured with `theme.algorithm: theme.darkAlgorithm`.

#### Scenario: Properties panel text is readable in dark mode

- **WHEN** the threejs-editor loads inside the shell's dark-themed iframe
- **THEN** all text in Segmented, Tree, Form labels, and ColorPicker is clearly visible against their backgrounds

#### Scenario: antd dark theme is consistent

- **WHEN** the OS switches between light and dark mode
- **THEN** the antd components in threejs-editor remain in dark theme

### Requirement: Monaco Editor uses dark theme

The Monaco Editor SHALL use `theme="vs-dark"`.

#### Scenario: Monaco Editor renders in dark

- **WHEN** the Properties panel shows the "json" tab
- **THEN** the Monaco Editor renders with dark background and light text

### Requirement: Hardcoded light-mode colors are replaced

Hardcoded light-mode color values SHALL be replaced with dark-mode-appropriate values.

#### Scenario: Borders are visible in dark mode

- **WHEN** the threejs-editor renders in dark theme
- **THEN** panel borders are visible
