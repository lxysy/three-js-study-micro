// Remove files exceeding Cloudflare Pages 25 MiB limit before deployment
import { readdir, stat, unlink } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const MAX_SIZE = 25 * 1024 * 1024 // 25 MiB
const DIST = resolve(import.meta.dirname, '..', 'dist')

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(full)
    } else {
      yield full
    }
  }
}

async function main() {
  const removed = []
  for await (const file of walk(DIST)) {
    const s = await stat(file)
    if (s.size > MAX_SIZE) {
      await unlink(file)
      removed.push({ file: file.replace(DIST + '/', ''), size: (s.size / 1024 / 1024).toFixed(1) })
    }
  }
  if (removed.length) {
    console.log(`Stripped ${removed.length} oversized file(s):`)
    removed.forEach(r => console.log(`  ✗ ${r.file} (${r.size} MiB)`))
  } else {
    console.log('No oversized files found.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
