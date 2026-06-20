## 1. Migrate to micro-app (core fix)

- [x] 1.1 Replace native `<iframe>` with `<micro-app name={demo.name} url={getDemoUrl(demo)} iframe />` in DemoViewer.jsx
- [x] 1.2 Use `onMounted` / `onError` callbacks to manage loading/loaded/error status (replace raw iframe `onLoad`/`onError`)
- [x] 1.3 Remove unused `iframeRef` and `microAppRef` refs (or repurpose microAppRef for micro-app instance)
- [x] 1.4 Remove `loadInIframe` function (no longer needed with micro-app managing load lifecycle)

## 2. Fix setTimeout leak

- [x] 2.1 Add `const timeoutRef = useRef(null)` in DemoViewer
- [x] 2.2 Store setTimeout ID in `timeoutRef.current` within the `useEffect` that depends on `demo`
- [x] 2.3 Call `clearTimeout(timeoutRef.current)` in the useEffect cleanup function

## 3. WebGL context lost recovery

- [x] 3.1 Add `glContextLost` state in DemoViewer
- [x] 3.2 In micro-app `onMounted` callback, access the iframe's canvas and attach `webglcontextlost` listener (wrapped in try/catch for cross-origin)
- [x] 3.3 When context is lost, set `glContextLost = true`
- [x] 3.4 Render a recovery overlay with "重新加载" button when `glContextLost` is true
- [x] 3.5 On retry click, increment `retryKey` to force micro-app remount via `key={`${demo.name}-${retryKey}`}`

## 4. Verification

- [x] 4.1 Run `npm run dev` and verify the sidebar loads with all demos listed (server on :5176, manifest 62 entries)
- [x] 4.2 Rapidly click 20+ different demos in sequence — confirm no crash (PASSED: 25 demos, 0 page errors, page alive)
- [x] 4.3 Verify switching between a GLB-heavy demo (home-decoration-editor) and a simple one (first-scene) works cleanly (PASSED)
- [x] 4.4 Verify sidebar collapse/expand still functions correctly (PASSED)
- [x] 4.5 Confirm the welcome screen still shows when no demo is selected (PASSED)
- [x] 4.6 Verify page stability after rapid switching (PASSED: 15 demos, 0 critical errors, page alive)
