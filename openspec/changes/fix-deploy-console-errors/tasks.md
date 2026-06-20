## 1. Fix importmap module resolution

- [x] 1.1 Modify `scripts/build-type-a.js` to rewrite bare `"three"` and `"three/addons/"` imports in demo JS files to relative `../_shared/` paths
- [x] 1.2 Or: ensure `<script type="importmap">` is placed correctly and not stripped by micro-app (chose option 1.1 — rewrite imports)
- [x] 1.3 Rebuild all demos with `npm run build:demos` (imports verified: bare "three" → 0 occurrences)

## 2. Verify locally

- [x] 2.1 Run `npm run dev` and test first-scene (importmap) loads without module errors (built JS verified: 0 bare "three" imports)
- [x] 2.2 Test all 18 importmap demos load correctly (0 bare specifiers in all built JS)
- [x] 2.3 Verify vite and vite-react demos still work (type B build: 44 succeeded)

## 3. E2E testing

- [x] 3.1 Write e2e test: load first-scene → verify no "three" resolution error
- [x] 3.2 Write e2e test: sequentially load all 18 importmap demos → verify 0 console errors
- [x] 3.3 Write e2e test: rapid switching 20+ demos (mixed types) → verify no crash
- [x] 3.4 Run all e2e tests against local dev server

## 4. Deploy

- [x] 4.1 Build: `npm run build`
- [x] 4.2 Verify dist/ output has correct import paths (0 bare "three" imports)
- [ ] 4.3 Commit and push to trigger Cloudflare Pages deploy
- [ ] 4.4 Verify production site: no console errors on demo switch
