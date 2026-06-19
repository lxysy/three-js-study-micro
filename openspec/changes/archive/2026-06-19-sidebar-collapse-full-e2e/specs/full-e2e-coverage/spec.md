## ADDED Requirements

### Requirement: Dynamic test generation from registry

The e2e test suite SHALL dynamically generate test cases for all demos listed in `src/registry/demos.json`.

#### Scenario: Every demo has a test case

- **WHEN** the test suite runs
- **THEN** each of the 61 demos in the registry gets an independent `test()` case
- **AND** each test case name includes the demo name and type

#### Scenario: Tests organized by category

- **WHEN** the test suite runs
- **THEN** test cases are grouped into `test.describe` blocks by category (basic, advanced, animation, effect, interaction, react-integration, other)

### Requirement: Canvas rendering verification

Each demo test case SHALL verify that a `<canvas>` element appears in the page within a timeout.

#### Scenario: Demo renders canvas successfully (regular timeout)

- **WHEN** a demo page loads
- **THEN** a `<canvas>` element (direct or within iframe) is detected within 15 seconds

#### Scenario: Large asset demo renders with extended timeout

- **WHEN** a demo requiring large assets (cube-camera-envmap, snowy-forest, etc.) loads
- **THEN** the canvas detection timeout is extended to 60 seconds

### Requirement: Local Chrome browser usage

The Playwright configuration SHALL use the locally installed Chrome browser instead of the bundled Chromium.

#### Scenario: Tests run on local Chrome

- **WHEN** `npx playwright test` is executed
- **THEN** tests run in the system-installed Chrome browser via `channel: 'chrome'`

#### Scenario: Fallback to Chromium if Chrome unavailable

- **WHEN** local Chrome is not installed or not found by Playwright
- **THEN** the test run falls back to the bundled Chromium browser

### Requirement: Shell navigation coverage

The e2e suite SHALL include tests for the shell app navigation behavior.

#### Scenario: Sidebar loads demo items

- **WHEN** navigating to the shell app root URL
- **THEN** the sidebar renders demo items from the loaded registry

#### Scenario: Switching demos via sidebar click

- **WHEN** user clicks two different demo items in the sidebar sequentially
- **THEN** an iframe is attached and the demo content loads for each selection

#### Scenario: Sidebar collapse toggle works in shell

- **WHEN** user clicks the sidebar toggle button
- **THEN** the sidebar collapses and the floating expand button appears
- **AND** clicking the floating button expands the sidebar back
