/**
 * build-type-a.js
 * Builds all Type A (importmap) demos:
 * - Copy HTML/JS/CSS and public assets to public/demos/<name>/
 * - Rewrite importmap paths from ./node_modules/three/ → ../_shared/three@<version>/
 * Usage: node scripts/build-type-a.js
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, cpSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DEMOS = join(ROOT, 'public', 'demos')
const REGISTRY_FILE = join(ROOT, 'src', 'registry', 'demos.json')
const META_FILE = join(ROOT, 'scripts', 'demo-meta.json')

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.vscode', '.claude', '.devkit',
  'scripts', 'src', 'public', 'dist', 'openspec', '.github',
])

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * Rewrite importmap in HTML: replace local node_modules paths with shared deps paths.
 * For third-party packages (simplex-noise, @tweenjs/tween.js, etc.), copies them
 * to the shared deps directory and rewrites the path.
 */
function rewriteImportmap(html, threeVersion, destDir) {
  const sharedThreePath = `/demos/_shared/three@${threeVersion}`

  // Find the importmap block
  const importmapRegex = /<script\s+type="importmap">([\s\S]*?)<\/script>/i
  const match = html.match(importmapRegex)

  if (!match) return html

  const importmapContent = match[1]

  // Parse all entries from the importmap
  let updatedContent = importmapContent

  // 1. Rewrite "three" entry
  updatedContent = updatedContent.replace(
    /"three":\s*"([^"]*)"/,
    (full, oldPath) => `"three": "${sharedThreePath}/build/three.module.js"`
  )

  // 2. Rewrite "three/addons/" entry
  updatedContent = updatedContent.replace(
    /"three\/addons\/":\s*"([^"]*)"/,
    (full, oldPath) => `"three/addons/": "${sharedThreePath}/examples/jsm/"`
  )

  // 3. Handle third-party entries (e.g., simplex-noise, @tweenjs/tween.js)
  //    that reference ./node_modules/...
  const thirdPartyRegex = /"([^"]+)":\s*"\.\/node_modules\/([^"]+)"/g
  updatedContent = updatedContent.replace(thirdPartyRegex, (full, key, npmPath) => {
    // Copy from root node_modules to shared deps
    const srcPath = join(ROOT, 'node_modules', npmPath)
    const destPath = join(PUBLIC_DEMOS, '_shared', npmPath)

    if (existsSync(srcPath)) {
      try {
        ensureDir(dirname(destPath))
        cpSync(srcPath, destPath)
      } catch {}
    }

    return `"${key}": "/demos/_shared/${npmPath}"`
  })

  return html.replace(importmapRegex, `<script type="importmap">${updatedContent}</script>`)
}

function copyDirContents(srcDir, destDir, excludeFiles = new Set()) {
  ensureDir(destDir)
  const items = readdirSync(srcDir)
  for (const item of items) {
    if (excludeFiles.has(item) || item === 'node_modules') continue
    const src = join(srcDir, item)
    const dest = join(destDir, item)
    if (statSync(src).isDirectory()) {
      cpSync(src, dest, { recursive: true })
    } else {
      cpSync(src, dest)
    }
  }
}

function copyPublicAssets(srcDir, destDir) {
  const publicDir = join(srcDir, 'public')
  if (existsSync(publicDir)) {
    const publicDest = join(destDir, 'public')
    ensureDir(publicDest)
    const items = readdirSync(publicDir)
    for (const item of items) {
      const src = join(publicDir, item)
      const dest = join(publicDest, item)
      if (statSync(src).isDirectory()) {
        cpSync(src, dest, { recursive: true })
      } else {
        cpSync(src, dest)
      }
    }
  }
}

/**
 * Rewrite bare "three" imports in JS files to relative paths.
 * This eliminates dependency on <script type="importmap"> which
 * may not work in micro-app iframe sandboxes.
 */
// Use root-relative path so imports resolve correctly regardless of
// the sandbox iframe's base URL (micro-app sets it to the main page URL)
function rewriteJSImports(dir, threeVersion, importmapEntries = {}) {
  const sharedThree = `/demos/_shared/three@${threeVersion}`
  const entries = readdirSync(dir, { recursive: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    if (!statSync(fullPath).isFile()) continue
    if (!entry.endsWith('.js') && !entry.endsWith('.mjs')) continue
    let content = readFileSync(fullPath, 'utf-8')
    let changed = false

    // Replace bare "three" import
    if (content.includes(`from "three"`) || content.includes(`from 'three'`)) {
      content = content.replace(
        /from\s+["']three["']/g,
        `from "${sharedThree}/build/three.module.js"`
      )
      changed = true
    }

    // Replace bare "three/addons/..." imports
    if (content.includes(`"three/addons/`) || content.includes(`'three/addons/`)) {
      content = content.replace(
        /from\s+["']three\/addons\/([^"']+)["']/g,
        (match, addonPath) => `from "${sharedThree}/examples/jsm/${addonPath}"`
      )
      changed = true
    }

    // Replace dynamic import() with bare specifiers
    if (content.includes(`import("three`)) {
      content = content.replace(
        /import\(["']three["']\)/g,
        `import("${sharedThree}/build/three.module.js")`
      )
      content = content.replace(
        /import\(["']three\/addons\/([^"']+)["']\)/g,
        (match, addonPath) => `import("${sharedThree}/examples/jsm/${addonPath}")`
      )
      changed = true
    }

    // Replace third-party bare imports using resolved importmap entries
    for (const [bareSpec, resolvedPath] of Object.entries(importmapEntries)) {
      if (bareSpec === 'three' || bareSpec === 'three/addons/') continue
      // Escape special regex chars in the specifier
      const escaped = bareSpec.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')
      const regex = new RegExp(`from\\s+["']${escaped}["']`, 'g')
      if (regex.test(content)) {
        content = content.replace(regex, `from "${resolvedPath}"`)
        changed = true
      }
      // Also handle dynamic imports
      const dynRegex = new RegExp(`import\\(["']${escaped}["']\\)`, 'g')
      if (dynRegex.test(content)) {
        content = content.replace(dynRegex, `import("${resolvedPath}")`)
        changed = true
      }
    }

    if (changed) {
      writeFileSync(fullPath, content, 'utf-8')
    }
  }
}

function buildDemo(name, srcDir) {
  const destDir = join(PUBLIC_DEMOS, name)
  ensureDir(destDir)

  console.log(`  → ${name}`)

  // Read package.json for three version
  const pkgPath = join(srcDir, 'package.json')
  let threeVersion = '0.175.0' // default fallback
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      if (pkg.dependencies?.three) {
        threeVersion = pkg.dependencies.three.replace('^', '')
      }
    } catch {}
  }

  // Read and process index.html
  const htmlPath = join(srcDir, 'index.html')
  if (existsSync(htmlPath)) {
    let html = readFileSync(htmlPath, 'utf-8')
    html = rewriteImportmap(html, threeVersion, destDir)
    writeFileSync(join(destDir, 'index.html'), html, 'utf-8')
  }

  // Files/dirs to exclude from copying
  const EXCLUDE_FILES = new Set(['package.json', 'package-lock.json', '.gitignore', 'index.html'])

  // Copy source files (JS, CSS, assets like .gltf/.glb/.bin/.png etc.)
  const srcSubdir = join(srcDir, 'src')
  if (existsSync(srcSubdir)) {
    // Demo uses src/ subdirectory — copy all files from there
    copyDirContents(srcSubdir, destDir, EXCLUDE_FILES)
  } else {
    // Copy all files from root (JS, CSS, GLTF, GLB, BIN, images, etc.)
    const items = readdirSync(srcDir)
    for (const item of items) {
      // Skip excluded files and node_modules
      if (EXCLUDE_FILES.has(item) || item === 'node_modules') continue
      const srcPath = join(srcDir, item)
      if (statSync(srcPath).isDirectory()) {
        // Recursively copy subdirectories (e.g., gltf1/, textures/)
        copyDirContents(srcPath, join(destDir, item), EXCLUDE_FILES)
      } else {
        cpSync(srcPath, join(destDir, item))
      }
    }
  }

  // Copy public assets
  copyPublicAssets(srcDir, destDir)

  // Extract importmap entries for JS import rewriting
  let importmapEntries = {}
  const htmlPath2 = join(destDir, 'index.html')
  if (existsSync(htmlPath2)) {
    const builtHtml = readFileSync(htmlPath2, 'utf-8')
    const imMatch = builtHtml.match(/<script\s+type="importmap">([\s\S]*?)<\/script>/i)
    if (imMatch) {
      try {
        const im = JSON.parse(imMatch[1])
        if (im.imports) importmapEntries = im.imports
      } catch {}
    }
  }

  // Rewrite bare imports in JS files to actual paths
  // This avoids relying on <script type="importmap"> which micro-app may not process
  rewriteJSImports(destDir, threeVersion, importmapEntries)

  return true
}

/**
 * Rewrite bare 'three' imports in shared Three.js addons files.
 * These files use import { ... } from 'three' which only works
 * when an importmap is present. Since micro-app may not process
 * importmaps correctly, we rewrite them to root-relative paths.
 */
function rewriteSharedAddonsImports() {
  const sharedDir = join(PUBLIC_DEMOS, '_shared')
  if (!existsSync(sharedDir)) return

  // Find all three@version directories
  const sharedEntries = readdirSync(sharedDir)
  for (const entry of sharedEntries) {
    const match = entry.match(/^three@(.+)$/)
    if (!match) continue
    const version = match[1]
    const threeDir = join(sharedDir, entry)
    const modulePath = `/demos/_shared/three@${version}/build/three.module.js`

    // Process all JS files in this version's directory
    const entries2 = readdirSync(threeDir, { recursive: true })
    for (const file of entries2) {
      if (!file.endsWith('.js') && !file.endsWith('.mjs')) continue
      const fullPath = join(threeDir, file)
      // Skip the main three.module.js and three.core.js (they use relative imports only)
      if (file === 'build/three.module.js' || file === 'build/three.core.js') continue
      let content = readFileSync(fullPath, 'utf-8')
      let changed = false

      // Replace bare 'three' import in addons files
      if (content.includes(`from 'three'`) || content.includes(`from "three"`)) {
        content = content.replace(
          /from\s+['"]three['"]/g,
          `from '${modulePath}'`
        )
        changed = true
      }

      if (changed) {
        writeFileSync(fullPath, content, 'utf-8')
      }
    }
  }
}

function main() {
  console.log('Building Type A (importmap) demos...')
  console.log()

  // Read registry to know which demos are Type A
  if (!existsSync(REGISTRY_FILE)) {
    console.error('Registry not found. Run scripts/prepare-registry.js first.')
    process.exit(1)
  }

  const registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf-8'))
  const typeADemos = registry.filter(d => d.type === 'importmap')

  ensureDir(PUBLIC_DEMOS)

  let success = 0
  let failed = 0

  for (const demo of typeADemos) {
    const srcDir = join(ROOT, demo.name)
    if (!existsSync(srcDir)) {
      console.warn(`  ⚠ ${demo.name}: source directory not found, skipping`)
      failed++
      continue
    }

    try {
      buildDemo(demo.name, srcDir)
      success++
    } catch (err) {
      console.error(`  ✗ ${demo.name}: ${err.message}`)
      failed++
    }
  }

  // Rewrite bare 'three' imports in shared addons for micro-app compat
  rewriteSharedAddonsImports()

  console.log()
  console.log(`Type A build complete: ${success} succeeded, ${failed} failed`)
  console.log(`Output: ${PUBLIC_DEMOS}`)
}

main()
