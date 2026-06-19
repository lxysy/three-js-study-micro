## ADDED Requirements

### Requirement: Toggle sidebar collapse

The system SHALL provide a toggle button in the sidebar header that collapses the entire sidebar to 0 width with a smooth CSS transition.

#### Scenario: User collapses sidebar

- **WHEN** user clicks the ☰ toggle button in the sidebar header
- **THEN** the sidebar transitions from 280px to 0px width over ~300ms
- **AND** the main content area expands to fill the full viewport width

#### Scenario: User expands sidebar

- **WHEN** user clicks the floating ☰ toggle button while the sidebar is collapsed
- **THEN** the sidebar transitions from 0px back to 280px width over ~300ms
- **AND** the main content area shrinks to accommodate the sidebar

### Requirement: Floating toggle button when collapsed

When the sidebar is collapsed, the system SHALL display a floating toggle button at the top-left corner of the viewport.

#### Scenario: Floating button visible when collapsed

- **WHEN** the sidebar is in collapsed state
- **THEN** a floating ☰ button is visible at position `top: 12px; left: 12px` with `position: fixed` and appropriate `z-index`
- **AND** the button has a semi-transparent background that becomes fully opaque on hover

#### Scenario: Floating button hidden when expanded

- **WHEN** the sidebar is in expanded state
- **THEN** the floating toggle button is not visible

### Requirement: Persist collapse state

The system SHALL persist the sidebar collapse state to localStorage and restore it on page load.

#### Scenario: State persists across page reloads

- **WHEN** user collapses the sidebar and refreshes the page
- **THEN** the sidebar remains in collapsed state after reload

#### Scenario: Default state is expanded

- **WHEN** a user visits the site for the first time (no saved state)
- **THEN** the sidebar is displayed in expanded state (280px)

#### Scenario: Handle localStorage failure gracefully

- **WHEN** localStorage is unavailable (e.g., privacy mode throws on write)
- **THEN** the sidebar defaults to expanded state without error

### Requirement: Smooth visual transition

The sidebar collapse/expand SHALL use CSS transition for smooth animation.

#### Scenario: Animated collapse

- **WHEN** sidebar state changes from expanded to collapsed
- **THEN** the width transition takes approximately 300ms with an ease timing function
- **AND** sidebar content is clipped via `overflow: hidden` during the transition

#### Scenario: No layout jump

- **WHEN** sidebar transitions between states
- **THEN** the main content area smoothly resizes without layout jumping
