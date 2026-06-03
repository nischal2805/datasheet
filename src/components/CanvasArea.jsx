import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { fabric } from 'fabric'
import { useFabricCanvas, CANVAS_W, CANVAS_H } from '../hooks/useFabricCanvas'

const CanvasArea = forwardRef(function CanvasArea(
  { activePage, frontImageURL, onSelectionChange },
  ref
) {
  const frontEl = useRef(null)
  const backEl = useRef(null)
  const frontFabric = useFabricCanvas(frontEl, frontImageURL, onSelectionChange)
  const backFabric = useFabricCanvas(backEl, null, onSelectionChange)

  // Deselect when switching pages
  useEffect(() => {
    if (frontFabric.current) {
      frontFabric.current.discardActiveObject()
      frontFabric.current.renderAll()
    }
    if (backFabric.current) {
      backFabric.current.discardActiveObject()
      backFabric.current.renderAll()
    }
    onSelectionChange?.(null)
  }, [activePage])

  useImperativeHandle(ref, () => ({
    getActiveCanvas: () => activePage === 'front' ? frontFabric.current : backFabric.current,
    getFrontCanvas: () => frontFabric.current,
    getBackCanvas: () => backFabric.current,

    // Click-to-place mode: cursor becomes crosshair, next click places text
    enterAddTextMode: (fontFamily, fontSize, fill) => {
      const canvas = activePage === 'front' ? frontFabric.current : backFabric.current
      if (!canvas) return
      canvas.defaultCursor = 'crosshair'
      canvas.hoverCursor = 'crosshair'
      canvas.isDrawingMode = false

      const handleUp = (opt) => {
        // Only place if not dragging an existing object
        if (opt.target) { cleanup(); return }
        const p = canvas.getPointer(opt.e)
        const text = new fabric.IText('Type here...', {
          left: p.x, top: p.y,
          fontFamily, fontSize, fill,
          angle: +(Math.random() * 2 - 1).toFixed(1),
          editable: true,
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
        text.enterEditing()
        text.selectAll()
        cleanup()
      }

      const cleanup = () => {
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
        canvas.off('mouse:up', handleUp)
      }

      canvas.on('mouse:up', handleUp)
    },
  }), [activePage])

  return (
    <div className="flex-1 flex items-center justify-center overflow-auto p-6"
      style={{ background: '#1e293b' }}>
      <div style={{ display: activePage === 'front' ? 'block' : 'none' }}>
        <canvas ref={frontEl}
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'block',
            width: CANVAS_W, height: CANVAS_H }} />
      </div>
      <div style={{ display: activePage === 'back' ? 'block' : 'none' }}>
        <canvas ref={backEl}
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'block',
            width: CANVAS_W, height: CANVAS_H }} />
      </div>
    </div>
  )
})

export default CanvasArea
