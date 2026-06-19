/**
 * prepare-registry.js
 * Scans all demo directories, categorizes them, and generates a JSON registry.
 * Usage: node scripts/prepare-registry.js
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const REGISTRY_OUT = join(ROOT, 'src', 'registry', 'demos.json')
const META_FILE = join(ROOT, 'scripts', 'demo-meta.json')

// Directories to exclude from scanning
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.vscode', '.claude', '.devkit',
  'scripts', 'src', 'public', 'dist', 'openspec',
  'node_modules', '.github',
])

// Known Vite React projects (have JSX/React dependencies)
const VITE_REACT_PROJECTS = new Set([
  'threejs-editor', 'css3d-computer', 't-shirt-design', 'react-three-app',
])

function scanDirectory(dir, meta) {
  const entries = readdirSync(dir)
  const demos = []

  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry)) continue
    if (entry.startsWith('.')) continue
    if (entry.startsWith('_')) continue

    const fullPath = join(dir, entry)
    if (!statSync(fullPath).isDirectory()) continue

    const demo = analyzeDemo(entry, fullPath, meta)
    if (demo) {
      demos.push(demo)
    }
  }

  return demos
}

function analyzeDemo(name, dir, meta) {
  const indexHtml = join(dir, 'index.html')
  const packageJson = join(dir, 'package.json')

  if (!existsSync(indexHtml)) return null

  let type = 'importmap'
  let threeVersion = null
  let hasPublicAssets = false

  // Read index.html to determine type
  const html = readFileSync(indexHtml, 'utf-8')

  if (html.includes('importmap')) {
    type = 'importmap'
  } else if (html.includes('src/main')) {
    type = VITE_REACT_PROJECTS.has(name) ? 'vite-react' : 'vite'
  }

  // Read package.json for three version
  if (existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'))
      if (pkg.dependencies && pkg.dependencies.three) {
        threeVersion = pkg.dependencies.three.replace('^', '')
      }
    } catch {}
  }

  // Check for public assets
  const publicDir = join(dir, 'public')
  if (existsSync(publicDir)) {
    try {
      const files = readdirSync(publicDir)
      hasPublicAssets = files.length > 0
    } catch {}
  }

  // Apply manual overrides from meta
  const manual = meta.demos?.[name]
  let description = manual?.description || ''
  let category = manual?.category || 'other'

  return {
    name,
    type,
    threeVersion: threeVersion || 'unknown',
    category,
    description,
    hasPublicAssets,
  }
}

function main() {
  // Read manual metadata
  let meta = { demos: {} }
  if (existsSync(META_FILE)) {
    try {
      meta = JSON.parse(readFileSync(META_FILE, 'utf-8'))
    } catch (e) {
      console.warn('Warning: Could not parse demo-meta.json:', e.message)
    }
  }

  const demos = scanDirectory(ROOT, meta)

  // Sort: basic → advanced → animation → effect → interaction → react-integration → other
  const catOrder = ['basic', 'advanced', 'animation', 'effect', 'interaction', 'react-integration', 'other']
  demos.sort((a, b) => {
    const ca = catOrder.indexOf(a.category)
    const cb = catOrder.indexOf(b.category)
    if (ca !== cb) return ca - cb
    return a.name.localeCompare(b.name)
  })

  // Write registry
  const registryDir = join(ROOT, 'src', 'registry')
  mkdirSync(registryDir, { recursive: true })
  writeFileSync(REGISTRY_OUT, JSON.stringify(demos, null, 2), 'utf-8')

  console.log(`Registry generated: ${demos.length} demos → ${REGISTRY_OUT}`)
  console.log(`  importmap: ${demos.filter(d => d.type === 'importmap').length}`)
  console.log(`  vite: ${demos.filter(d => d.type === 'vite').length}`)
  console.log(`  vite-react: ${demos.filter(d => d.type === 'vite-react').length}`)

  // Also write a copy to public/ for the shell app
  const publicManifest = join(ROOT, 'public', 'demos-manifest.json')
  try {
    writeFileSync(publicManifest, JSON.stringify(demos, null, 2), 'utf-8')
  } catch {}

  // Write manifest in public/demos/ as fallback
  const demosManifest = join(ROOT, 'public', 'demos', 'demos-manifest.json')
  try {
    const publicDemosDir = join(ROOT, 'public', 'demos')
    mkdirSync(publicDemosDir, { recursive: true })
    writeFileSync(manifestOut, JSON.stringify(demos, null, 2), 'utf-8')
  } catch {}
}

main()
