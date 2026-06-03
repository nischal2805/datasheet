import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'

export const CANVAS_W = 560
export const CANVAS_H = Math.round(560 * 250 / 176)

export function useFabricCanvas(canvasElRef, backgroundImageURL, onSelectionChange) {
  const fabricRef = useRef(null)
  const onSelRef = useRef(onSelectionChange)

  useEffect(() => { onSelRef.current = onSelectionChange }, [onSelectionChange])

  useEffect(() => {
    if (!canvasElRef.current) return

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: 'white',
      selection: true,
    })
    fabricRef.current = canvas

    const notify = () => {
      const obj = canvas.getActiveObject()
      if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
        onSelRef.current?.({ fontFamily: obj.fontFamily, fontSize: obj.fontSize,
          fill: obj.fill, text: obj.text, object: obj })
      } else {
        onSelRef.current?.(null)
      }
    }

    canvas.on('selection:created', notify)
    canvas.on('selection:updated', notify)
    canvas.on('selection:cleared', () => onSelRef.current?.(null))
    canvas.on('text:changed', (e) => {
      onSelRef.current?.({ fontFamily: e.target.fontFamily, fontSize: e.target.fontSize,
        fill: e.target.fill, text: e.target.text, object: e.target })
    })

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
        if (!img || !img.width) return
        img.scaleToWidth(CANVAS_W)
        canvas.setBackgroundImage(img, () => canvas.renderAll())
      }, { crossOrigin: 'anonymous' })
    } else {
      canvas.setBackgroundImage(null, () => {
        canvas.backgroundColor = 'white'
        canvas.renderAll()
      })
    }
  }, [backgroundImageURL])

  return fabricRef
}
