export const FONT_PRESETS = [
  'Caveat',
  'Kalam',
  'Patrick Hand',
  'Gochi Hand',
  'Indie Flower',
]

const loaded = new Set()

export async function loadGoogleFont(fontName) {
  if (loaded.has(fontName)) return
  const family = fontName.replace(/ /g, '+')
  const href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
  loaded.add(fontName)
  await document.fonts.ready
}
