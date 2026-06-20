## ADDED Requirements

### Requirement: All demo types load in micro-app

The DemoViewer SHALL correctly load all three demo types (importmap, vite, vite-react)
inside `<micro-app>` iframe without console errors on production deployments.

#### Scenario: vite demo loads without errors

- **WHEN** user clicks a vite-type demo (e.g., geometry-color)
- **THEN** the demo renders without page errors in the console

#### Scenario: vite-react demo loads without errors

- **WHEN** user clicks a vite-react-type demo (e.g., home-decoration-editor)
- **THEN** the demo renders without page errors in the console
