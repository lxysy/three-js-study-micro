## ADDED Requirements

### Requirement: antd components use unified dark theme

The threejs-editor app SHALL wrap its component tree with antd `ConfigProvider` configured with `theme.algorithm: theme.darkAlgorithm`, ensuring all antd components (Menu, Segmented, Tree, Form, ColorPicker, FloatButton) render with dark theme colors regardless of system `prefers-color-scheme`.

#### Scenario: Properties panel text is readable in dark mode

- **WHEN** the threejs-editor loads inside the shell's dark-themed iframe
- **THEN** all text in Segmented, Tree, Form labels, and ColorPicker is clearly visible against their backgrounds
- **AND** text contrast meets at least WCAG AA level (4.5:1 for normal text)

#### Scenario: antd dark theme is consistent

- **WHEN** the OS switches between light and dark mode
- **THEN** the antd components in threejs-editor remain in dark theme (do not follow OS preference)

### Requirement: Monaco Editor uses dark theme

The Monaco Editor in the Properties panel SHALL use `theme="vs-dark"` for consistent dark appearance.

#### Scenario: Monaco Editor renders in dark

- **WHEN** the Properties panel shows the "json" tab
- **THEN** the Monaco Editor renders with dark background and light text

### Requirement: Hardcoded light-mode colors are replaced

Any hardcoded light-mode color values in `App.scss` (e.g., `#000` borders) SHALL be replaced with dark-mode-appropriate values.

#### Scenario: Borders are visible in dark mode

- **WHEN** the threejs-editor renders in dark theme
- **THEN** panel borders are visible (not pure black on dark background)
