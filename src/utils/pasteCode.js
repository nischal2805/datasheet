import { fabric } from 'fabric'

export async function pasteCodeToCanvas(canvas, { fontFamily, fontSize, fill }) {
  let text
  try {
    text = await navigator.clipboard.readText()
  } catch {
    text = prompt('Paste your code here:') ?? ''
  }
  if (!text.trim()) return

  const box = new fabric.Textbox(text, {
    left: 20,
    top: 20,
    width: canvas.width - 40,
    fontFamily,
    fontSize,
    fill,
    lineHeight: 1.4,
    angle: +(Math.random() * 2 - 1).toFixed(1),
  })
  canvas.add(box)
  canvas.setActiveObject(box)
  canvas.renderAll()
}
