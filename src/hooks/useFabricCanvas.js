import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'

export const CANVAS_W = 560
export const CANVAS_H = Math.round(560 * 250 / 176) // 795 — preserves 176:250 ratio

export function useFabricCanvas(canvasElRef, backgroundImageURL) {
  const fabricRef = useRef(null)

  useEffect(() => {
    if (!canvasElRef.current) return

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: 'white',
      selection: true,
    })
    fabricRef.current = canvas

    const handleKeyDown = (e) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        !e.target.matches('input, textarea, select, [contenteditable]')
      ) {
        const obj = canvas.getActiveObject()
        if (obj && !obj.isEditing) {
          canvas.remove(obj)
          canvas.discardActiveObject()
          canvas.renderAll()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      canvas.dispose()
      fabricRef.current = null
    }
  }, [canvasElRef])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    if (backgroundImageURL) {
      fabric.Image.fromURL(backgroundImageURL, (img) => {
        img.scaleToWidth(CANVAS_W)
        canvas.setBackgroundImage(img, () => canvas.renderAll())
      })
    } else {
      canvas.setBackgroundImage(null, () => {
        canvas.backgroundColor = 'white'
        canvas.renderAll()
      })
    }
  }, [backgroundImageURL])

  return fabricRef
}
