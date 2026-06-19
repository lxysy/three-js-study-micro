/**
 * build-all.js
 * Orchestration script for building all demos and the shell.
 * Usage: node scripts/build-all.js [--skip-type-b]
 */

const steps = [
  { name: 'Prepare Registry', cmd: 'node scripts/prepare-registry.js' },
  { name: 'Prepare Shared Deps', cmd: 'node scripts/prepare-shared-deps.js' },
  { name: 'Build Type A (importmap)', cmd: 'node scripts/build-type-a.js' },
  { name: 'Build Type B (Vite)', cmd: 'node scripts/build-type-b.js' },
  { name: 'Build Shell (Vite)', cmd: 'npx vite build' },
]

const skipTypeB = process.argv.includes('--skip-type-b')

async function run() {
  console.log('=== Three.js Study Micro-Frontend Build ===')
  console.log()

  for (const step of steps) {
    if (skipTypeB && step.name === 'Build Type B (Vite)') {
      console.log(`⏭ Skipping: ${step.name}`)
      continue
    }

    console.log(`▶ ${step.name}...`)
    console.time(step.name)

    const { execSync } = await import('child_process')
    try {
      execSync(step.cmd, {
        cwd: process.cwd(),
        stdio: 'inherit',
        timeout: 600000,
      })
      console.timeEnd(step.name)
      console.log(`✓ ${step.name} complete`)
    } catch (err) {
      console.error(`✗ ${step.name} failed: ${err.message}`)
      if (step.name === 'Build Type B (Vite)') {
        console.log('  Continuing with shell build anyway...')
      } else {
        process.exit(1)
      }
    }
    console.log()
  }

  console.log('=== Build Complete ===')
}

run()
