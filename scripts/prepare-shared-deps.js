/**
 * prepare-shared-deps.js
 * Downloads needed Three.js versions to the shared dependencies directory.
 * Usage: node scripts/prepare-shared-deps.js
 */

import { existsSync, mkdirSync, writeFileSync, readdirSync, rmSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SHARED_DIR = join(ROOT, 'public', 'demos', '_shared')

// Versions needed across all demos
const VERSIONS = ['0.175.0', '0.176.0', '0.184.0']

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function downloadVersion(version) {
  const targetDir = join(SHARED_DIR, `three@${version}`)
  const buildDir = join(targetDir, 'build')
  const jsmDir = join(targetDir, 'examples', 'jsm')

  // Check if already downloaded
  if (existsSync(join(buildDir, 'three.module.js'))) {
    console.log(`  ✓ three@${version} already exists, skipping`)
    return true
  }

  console.log(`  → Downloading three@${version}...`)

  try {
    ensureDir(targetDir)

    // Create a temporary package.json to install three
    const tmpDir = join(ROOT, '.tmp-three')
    ensureDir(tmpDir)

    const tmpPkg = {
      name: 'tmp-three-install',
      private: true,
      dependencies: { three: version }
    }
    writeFileSync(join(tmpDir, 'package.json'), JSON.stringify(tmpPkg, null, 2), 'utf-8')

    // Install
    execSync('npm install --no-audit --no-fund --loglevel=error', {
      cwd: tmpDir,
      stdio: 'pipe',
    })

    // Copy three module files
    const threeDir = join(tmpDir, 'node_modules', 'three')

    // Copy all build files (three.module.js, three.core.js, etc.)
    const srcBuild = join(threeDir, 'build')
    if (existsSync(srcBuild)) {
      ensureDir(buildDir)
      cpSync(srcBuild, buildDir, { recursive: true })
    }

    // Copy examples/jsm/ - need key addons
    const srcJsm = join(threeDir, 'examples', 'jsm')
    if (existsSync(srcJsm)) {
      ensureDir(jsmDir)
      // Copy specific subdirectories that demos commonly use
      const subdirs = ['controls', 'loaders', 'libs', 'helpers', 'math', 'objects', 'postprocessing', 'renderers', 'shaders', 'utils']
      for (const sub of subdirs) {
        const subPath = join(srcJsm, sub)
        if (existsSync(subPath)) {
          const targetSub = join(jsmDir, sub)
          // Use recursive cpSync for directories
          cpSync(subPath, targetSub, { recursive: true })
        }
      }
    }

    // Clean up
    rmSync(tmpDir, { recursive: true, force: true })

    console.log(`  ✓ three@${version} installed to ${targetDir}`)
    return true
  } catch (err) {
    console.error(`  ✗ Failed to download three@${version}:`, err.message)
    return false
  }
}

function main() {
  console.log('Preparing shared Three.js dependencies...')
  console.log(`Target: ${SHARED_DIR}`)
  console.log(`Versions: ${VERSIONS.join(', ')}`)
  console.log()

  ensureDir(SHARED_DIR)
  let success = 0
  let failed = 0

  for (const ver of VERSIONS) {
    if (downloadVersion(ver)) {
      success++
    } else {
      failed++
    }
  }

  console.log()
  console.log(`Done: ${success} succeeded, ${failed} failed`)

  if (failed > 0) {
    process.exit(1)
  }
}

main()
