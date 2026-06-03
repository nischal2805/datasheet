export async function loadCustomFont(file) {
  const fontName = file.name.replace(/\.[^/.]+$/, '')
  const url = URL.createObjectURL(file)
  const font = new FontFace(fontName, `url(${url})`)
  const loaded = await font.load()
  document.fonts.add(loaded)
  return fontName
}
