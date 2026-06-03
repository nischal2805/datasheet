import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const OUT = 'smoke-screenshots'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
page.on('console', m => m.type() === 'error' && console.error('CONSOLE ERROR:', m.text()))

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.screenshot({ path: path.join(OUT, '1-initial.png'), fullPage: false })
console.log('✓ initial load')

// Click Back tab
await page.click('button:has-text("Back")')
await page.screenshot({ path: path.join(OUT, '2-back-tab.png') })
console.log('✓ back tab')

// Click Front tab
await page.click('button:has-text("Front")')

// Click Add Text Box
await page.click('button:has-text("Add Text Box")')
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, '3-textbox-added.png') })
console.log('✓ add text box')

await browser.close()
console.log('Screenshots saved to', OUT)
