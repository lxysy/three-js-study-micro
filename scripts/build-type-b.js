/**
 * build-type-b.js
 * Builds all Type B (Vite) demos.
 * - For each Vite project, runs vite build with appropriate config
 * - Outputs to public/demos/<name>/
 * Usage: node scripts/build-type-b.js
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { cpus } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DEMOS = join(ROOT, 'public', 'demos')
const REGISTRY_FILE = join(ROOT, 'src', 'registry', 'demos.json')

const MAX_CONCURRENT = Math.min(4, cpus().length - 1 || 1)
const BUILD_TIMEOUT = 120000 // 2 minutes per project

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * Generate a temporary vite.config.js for projects that don't have one
 */
function generateTempViteConfig(projectDir, name) {
  const configPath = join(projectDir, 'vite.config.js')
  if (existsSync(configPath)) {
    return null // Already has config
  }

  const configContent = `import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    outDir: '../public/demos/${name}',
    emptyOutDir: true,
  },
  // Serving static files for dev
  publicDir: 'public',
})
`
  writeFileSync(configPath, configContent, 'utf-8')
  return configPath
}

/**
 * Check if project uses React (has react/vitejs-plugin-react in deps/devDeps)
 */
function usesReact(projectDir) {
  const pkgPath = join(projectDir, 'package.json')
  if (!existsSync(pkgPath)) return false

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    return deps.react !== undefined || deps['@vitejs/plugin-react'] !== undefined
  } catch {
    return false
  }
}

/**
 * Get or create a proper vite config for building as sub-app
 */
function prepareViteConfig(projectDir, name, isReact) {
  const configPath = join(projectDir, 'vite.config.js')
  let backupPath = null

  // If config exists, back it up and create a build-specific one
  if (existsSync(configPath)) {
    const original = readFileSync(configPath, 'utf-8')
    backupPath = join(projectDir, 'vite.config.js.bak')
    writeFileSync(backupPath, original, 'utf-8')
  }

  // Generate build config with correct base and outDir
  const reactPlugin = isReact ? "import react from '@vitejs/plugin-react'\n" : ''
  const plugins = isReact ? "  plugins: [react()],\n" : ''

  const configContent = `${reactPlugin}import { defineConfig } from 'vite'

export default defineConfig({
${plugins}  base: './',
  build: {
    outDir: '${join('..', 'public', 'demos', name).replace(/\\/g, '\\\\')}',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
`
  writeFileSync(configPath, configContent, 'utf-8')
  return backupPath
}

/**
 * Restore original vite config after build
 */
function restoreViteConfig(projectDir, backupPath) {
  const configPath = join(projectDir, 'vite.config.js')
  if (backupPath && existsSync(backupPath)) {
    writeFileSync(configPath, readFileSync(backupPath, 'utf-8'), 'utf-8')
    rmSync(backupPath)
  }
}

/**
 * Build a single Vite project
 */
/**
 * Recursively check if a directory contains SCSS/SASS files (cross-platform)
 */
function hasScssFiles(dir) {
  const srcDir = join(dir, 'src')
  if (!existsSync(srcDir)) return false

  try {
    const stack = [srcDir]
    while (stack.length > 0) {
      const current = stack.pop()
      const items = readdirSync(current)
      for (const item of items) {
        const fullPath = join(current, item)
        if (statSync(fullPath).isDirectory()) {
          if (item !== 'node_modules') stack.push(fullPath)
        } else if (item.endsWith('.scss') || item.endsWith('.sass')) {
          return true
        }
      }
    }
  } catch {}
  return false
}

function buildViteProject(name, projectDir, isReact) {
  console.log(`  → ${name}${isReact ? ' (React)' : ''}`)

  if (!existsSync(join(projectDir, 'index.html'))) {
    throw new Error('No index.html found')
  }

  // Check for node_modules
  if (!existsSync(join(projectDir, 'node_modules'))) {
    console.log(`    Installing dependencies for ${name}...`)
    execSync('npm install --no-audit --no-fund --loglevel=error', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120000,
    })
  }

  // Ensure sass-embedded is available for projects using SCSS (Vite 8+)
  if (hasScssFiles(projectDir) && !existsSync(join(projectDir, 'node_modules', 'sass-embedded'))) {
    try {
      execSync('npm install sass-embedded --no-save --no-audit --no-fund --loglevel=error', {
        cwd: projectDir,
        stdio: 'pipe',
        timeout: 60000,
      })
    } catch {}
  }

  // Prepare config
  const backupPath = prepareViteConfig(projectDir, name, isReact)

  try {
    // Run vite build
    execSync('npx vite build --logLevel warn', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: BUILD_TIMEOUT,
    })

    // Ensure output exists
    const outputDir = join(PUBLIC_DEMOS, name)
    if (!existsSync(outputDir) || !existsSync(join(outputDir, 'index.html'))) {
      // Try the default dist/ dir as fallback
      const distDir = join(projectDir, 'dist')
      if (existsSync(join(distDir, 'index.html'))) {
        ensureDir(outputDir)
        cpSync(distDir, outputDir, { recursive: true })
        rmSync(distDir, { recursive: true, force: true })
      } else {
        throw new Error('Build output not found')
      }
    }

  } finally {
    restoreViteConfig(projectDir, backupPath)
  }

  return true
}

async function main() {
  console.log('Building Type B (Vite) demos...')
  console.log()

  // Read registry
  if (!existsSync(REGISTRY_FILE)) {
    console.error('Registry not found. Run scripts/prepare-registry.js first.')
    process.exit(1)
  }

  const registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf-8'))
  const typeBDemos = registry.filter(d => d.type === 'vite' || d.type === 'vite-react')

  ensureDir(PUBLIC_DEMOS)

  // Build sequentially to avoid resource conflicts
  let success = 0
  let failed = 0
  const failedList = []

  for (const demo of typeBDemos) {
    const projectDir = join(ROOT, demo.name)
    if (!existsSync(projectDir)) {
      console.warn(`  ⚠ ${demo.name}: source directory not found, skipping`)
      failed++
      failedList.push(demo.name)
      continue
    }

    try {
      buildViteProject(demo.name, projectDir, demo.type === 'vite-react')
      success++
    } catch (err) {
      console.error(`  ✗ ${demo.name}: ${err.message}`)
      failed++
      failedList.push(demo.name)
    }
  }

  console.log()
  console.log(`Type B build complete: ${success} succeeded, ${failed} failed`)
  if (failed > 0) {
    console.log(`Failed demos: ${failedList.join(', ')}`)
  }
}

main()
