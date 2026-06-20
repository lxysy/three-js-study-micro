## ADDED Requirements

### Requirement: Importmap demos load without module errors

Importmap-type demos loaded via `<micro-app>` SHALL resolve ES module imports
without throwing "Failed to resolve module specifier" errors in the browser console.

#### Scenario: Load an importmap demo in production

- **WHEN** user clicks an importmap-type demo (e.g., first-scene) in the sidebar
- **THEN** the demo's JavaScript modules resolve successfully via the importmap
- **AND** no "Failed to resolve module specifier" error appears in the console

#### Scenario: Switch between importmap and vite demos

- **WHEN** user switches from a vite demo to an importmap demo and back
- **THEN** both demo types load correctly without module resolution errors
