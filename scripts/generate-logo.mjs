import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'assets/borrowpilot-logo.svg')

const logo = `<svg width="520" height="128" viewBox="0 0 520 128" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">BorrowPilot</title>
  <desc id="desc">BorrowPilot logo with a forward-moving B mark</desc>
  <rect x="8" y="8" width="112" height="112" rx="30" fill="#17202B"/>
  <path d="M43 39V89" stroke="#F5F6F8" stroke-width="11" stroke-linecap="round"/>
  <path d="M43 40H67C78 40 85 45 85 53C85 60 79 64 69 64H43" stroke="#5A8FF0" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M43 64H72C84 64 91 69 91 78C91 87 83 91 70 91H43" stroke="#72C2B0" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M77 27L91 27L91 41" stroke="#F0B35C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M91 27L76 42" stroke="#F0B35C" stroke-width="7" stroke-linecap="round"/>
  <text x="144" y="82" fill="#17202B" font-family="'Space Grotesk', 'Arial', sans-serif" font-size="50" font-weight="600" letter-spacing="-2.5">BorrowPilot</text>
</svg>
`

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, logo)
console.log(`Generated ${output}`)
