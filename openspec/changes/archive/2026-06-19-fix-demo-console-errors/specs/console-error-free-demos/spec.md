## ADDED Requirements

### Requirement: Build scripts copy all asset files

The Type A build script (`build-type-a.js`) SHALL copy all non-directory files from the source demo directory to the build output, not only `.js` and `.css` files. This includes `.gltf`, `.glb`, `.bin`, `.png`, `.jpg`, `.svg`, `.json`, and any other asset files referenced by the demo code.

#### Scenario: GLTF model files are deployed

- **WHEN** a Type A demo references a `.gltf` or `.glb` file in its source root directory
- **THEN** the build script copies that file to the output directory alongside the JS and HTML files

#### Scenario: Build-metadata files are excluded

- **WHEN** the build script scans the source directory
- **THEN** it SHALL NOT copy `package.json`, `package-lock.json`, `node_modules`, or `.gitignore` files

#### Scenario: Binary files are deployed

- **WHEN** a Type A demo has `.bin` or image files in its source root
- **THEN** the build script copies them to the output directory

### Requirement: Type B demo assets in public directory

For Type B (Vite) demos that reference 3D model files via GLTFLoader string paths, the model files SHALL be placed in the Vite `public/` directory so they are copied to the build output.

#### Scenario: GLTF files in public/ are deployed

- **WHEN** a Type B demo has model files in its `public/` directory
- **THEN** Vite copies them to the output root during `vite build`
- **AND** the demo code can reference them with absolute paths (e.g., `/model.glb`)

### Requirement: E2E tests assert zero console errors

Each demo e2e test case SHALL assert that no uncaught JavaScript exceptions (`pageerror`) or `console.error` calls occur during page load.

#### Scenario: Demo loads without console errors

- **WHEN** a demo page loads in the test browser
- **THEN** no `pageerror` events fire
- **AND** no `console.error` messages are logged (excluding whitelisted external URLs)

#### Scenario: Demo with console error fails the test

- **WHEN** a demo page triggers a `pageerror` or `console.error` during load
- **THEN** the test case SHALL fail with the error message included in the failure output

#### Scenario: External tracker CORS errors are whitelisted

- **WHEN** a demo triggers a console error from an external URL (e.g., `sogou.com`, `qq.com`)
- **THEN** that error SHALL be filtered out and not cause a test failure
