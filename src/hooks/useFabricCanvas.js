import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'

export const CANVAS_W = 560
export const CANVAS_H = Math.round(560 * 250 / 176)

// Global selection style — amber, visible on white sheets
Object.assign(fabric.Object.prototype, {
  borderColor: '#f59e0b',
  cornerColor: '#ffffff',
  cornerStrokeColor: '#f59e0b',
  cornerSize: 9,
  transparentCorners: false,
  padding: 5,
  borderScaleFactor: 1.5,
})

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
      selectionColor: 'rgba(245,158,11,0.08)',
      selectionBorderColor: '#f59e0b',
      selectionLineWidth: 1,
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
    // Defer null notification — exitEditing() can briefly fire selection:cleared
    // before selection:created fires again. If object is re-selected by the time
    // the frame runs, we skip the null so panels stay in sync.
    canvas.on('selection:cleared', () => {
      requestAnimationFrame(() => {
        if (!canvas.getActiveObject()) onSelRef.current?.(null)
      })
    })
    // text:changed fires while user types inside IText — keep code panel in sync
    canvas.on('text:changed', (e) => {
      onSelRef.current?.({ fontFamily: e.target.fontFamily, fontSize: e.target.fontSize,
        fill: e.target.fill, text: e.target.text, object: e.target })
    })
    // object:modified fires after resize/rotate — re-sync sidebar values
    canvas.on('object:modified', notify)

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
        // Stretch to fill entire canvas — ignore source aspect ratio
        img.set({
          scaleX: CANVAS_W / img.width,
          scaleY: CANVAS_H / img.height,
          left: 0, top: 0,
          originX: 'left', originY: 'top',
        })
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
