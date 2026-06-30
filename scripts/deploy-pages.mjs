import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const root = process.cwd()
const dist = join(root, 'dist')
const deployDir = join(root, '.gh-pages-deploy')
const remote = execSync('git remote get-url origin', { cwd: root, encoding: 'utf8' }).trim()

console.log('Building for GitHub Pages...')
execSync('npm run build', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: 'true' },
})

if (!existsSync(dist)) {
  console.error('No existe dist/ tras el build.')
  process.exit(1)
}

rmSync(deployDir, { recursive: true, force: true })
mkdirSync(deployDir, { recursive: true })

cpSync(dist, deployDir, { recursive: true })
writeFileSync(join(deployDir, '.nojekyll'), '')

execSync('git init', { cwd: deployDir, stdio: 'inherit' })
execSync('git config user.email "deploy@procesador-imagenes-ia.local"', { cwd: deployDir, stdio: 'inherit' })
execSync('git config user.name "Procesador Imagenes IA Deploy"', { cwd: deployDir, stdio: 'inherit' })
execSync('git checkout -b gh-pages', { cwd: deployDir, stdio: 'inherit' })
execSync('git add -A', { cwd: deployDir, stdio: 'inherit' })
execSync('git commit -m "Deploy GitHub Pages"', { cwd: deployDir, stdio: 'inherit' })
execSync(`git push --force ${remote} gh-pages`, { cwd: deployDir, stdio: 'inherit' })

rmSync(deployDir, { recursive: true, force: true })
console.log('Deploy completado: https://jeova33.github.io/procesador-imagenes-ia/')