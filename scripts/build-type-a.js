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
  const sharedThreePath = `../_shared/three@${threeVersion}`

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

    return `"${key}": "../_shared/${npmPath}"`
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

  return true
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

  console.log()
  console.log(`Type A build complete: ${success} succeeded, ${failed} failed`)
  console.log(`Output: ${PUBLIC_DEMOS}`)
}

main()
