## ADDED Requirements

### Requirement: Demos are loaded via micro-app component

The DemoViewer SHALL use the `<micro-app>` custom element (provided by `@micro-zoe/micro-app`)
instead of a native `<iframe>` to load each demo, enabling framework-managed lifecycle hooks
for resource cleanup.

#### Scenario: Load a demo via micro-app

- **WHEN** user selects a demo from the sidebar
- **THEN** a `<micro-app name={demo.name} url={getDemoUrl(demo)} iframe>` element is rendered
- **AND** the demo's HTML/JS/CSS loads in an iframe sandbox managed by micro-app

#### Scenario: Same demo clicked twice

- **WHEN** user clicks the currently active demo in the sidebar
- **THEN** the micro-app element SHALL NOT be recreated (no-op)

### Requirement: WebGL cleanup on unmount

When micro-app unmounts a demo (user switches away), the old demo's iframe document
SHALL be fully destroyed — including its WebGL context, requestAnimationFrame loops,
and DOM event listeners — preventing GPU resource accumulation.

#### Scenario: Switch from demo A to demo B

- **WHEN** user clicks demo B while demo A is loaded
- **THEN** micro-app unmounts demo A's iframe, releasing its WebGL context
- **AND** micro-app mounts demo B's iframe from scratch
- **AND** the browser's WebGL context count does not increase cumulatively

### Requirement: Loading timeout cleanup

The loading timeout timer SHALL be cleared when the demo changes or the component
unmounts, preventing stale timeout callbacks from accumulating.

#### Scenario: Clear timeout on demo switch

- **WHEN** user switches from demo A to demo B before demo A finishes loading
- **THEN** the timeout scheduled for demo A is cancelled with clearTimeout
- **AND** a new timeout is scheduled for demo B

#### Scenario: Clear timeout on unmount

- **WHEN** the DemoViewer component unmounts
- **THEN** any pending loading timeout is cleared

### Requirement: WebGL context loss recovery

When the browser loses the WebGL rendering context (CONTEXT_LOST_WEBGL event),
the system SHALL display a recovery UI allowing the user to reload the demo.

#### Scenario: WebGL context lost detected

- **WHEN** a demo's iframe fires a webglcontextlost event
- **THEN** the DemoViewer displays an error overlay with a "重新加载" (reload) button
- **AND** the loading spinner is hidden

#### Scenario: User triggers reload after context loss

- **WHEN** user clicks "重新加载" on the WebGL context loss overlay
- **THEN** the micro-app element is remounted with a fresh URL (same demo)
- **AND** a new WebGL context is initialized
