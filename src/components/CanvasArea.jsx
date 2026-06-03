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

    enterAddTextMode: (fontFamily, fontSize, fill) => {
      const canvas = activePage === 'front' ? frontFabric.current : backFabric.current
      if (!canvas) return

      canvas.defaultCursor = 'crosshair'
      canvas.hoverCursor = 'crosshair'
      canvas.selection = false   // prevent fabric rubber-band selection during draw

      let startX = 0, startY = 0, started = false
      let preview = null

      const onDown = (opt) => {
        if (opt.target) return  // hit existing object — let fabric handle, exit on mouseup
        const p = canvas.getPointer(opt.e)
        startX = p.x; startY = p.y; started = true
        preview = new fabric.Rect({
          left: startX, top: startY, width: 1, height: 1,
          fill: 'rgba(245,158,11,0.07)',
          stroke: '#f59e0b', strokeWidth: 1,
          strokeDashArray: [5, 4],
          selectable: false, evented: false,
        })
        canvas.add(preview)
      }

      const onMove = (opt) => {
        if (!started || !preview) return
        const p = canvas.getPointer(opt.e)
        const w = p.x - startX, h = p.y - startY
        preview.set({
          left: w >= 0 ? startX : p.x,
          top:  h >= 0 ? startY : p.y,
          width: Math.abs(w),
          height: Math.abs(h),
        })
        canvas.renderAll()
      }

      const onUp = (opt) => {
        if (!started) { cleanup(); return }

        const p = canvas.getPointer(opt.e)
        const w = Math.abs(p.x - startX)
        const h = Math.abs(p.y - startY)

        if (preview) { canvas.remove(preview); preview = null }
        cleanup()

        if (w > 15 || h > 15) {
          // Drag → Textbox that fills the drawn region
          const left = Math.min(startX, p.x)
          const top  = Math.min(startY, p.y)
          const box = new fabric.Textbox('Type here...', {
            left, top,
            width: Math.max(w, 60),
            fontFamily, fontSize, fill,
            lineHeight: 1.4, editable: true,
          })
          canvas.add(box)
          canvas.setActiveObject(box)
          canvas.renderAll()
          box.enterEditing()
          box.selectAll()
        } else {
          // Click (no drag) → IText at exact point
          const text = new fabric.IText('Type here...', {
            left: startX, top: startY,
            fontFamily, fontSize, fill,
            angle: +(Math.random() * 2 - 1).toFixed(1),
            editable: true,
          })
          canvas.add(text)
          canvas.setActiveObject(text)
          canvas.renderAll()
          text.enterEditing()
          text.selectAll()
        }
      }

      const onEsc = (e) => { if (e.key === 'Escape') cleanup() }

      const cleanup = () => {
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
        canvas.selection = true
        if (preview) { canvas.remove(preview); preview = null }
        canvas.off('mouse:down', onDown)
        canvas.off('mouse:move', onMove)
        canvas.off('mouse:up', onUp)
        window.removeEventListener('keydown', onEsc)
        canvas.renderAll()
      }

      canvas.on('mouse:down', onDown)
      canvas.on('mouse:move', onMove)
      canvas.on('mouse:up', onUp)
      window.addEventListener('keydown', onEsc)
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
