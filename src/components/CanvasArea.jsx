import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { useFabricCanvas, CANVAS_W, CANVAS_H } from '../hooks/useFabricCanvas'

const CanvasArea = forwardRef(function CanvasArea(
  { activePage, frontImageURL },
  ref
) {
  const frontEl = useRef(null)
  const backEl = useRef(null)
  const frontFabric = useFabricCanvas(frontEl, frontImageURL)
  const backFabric = useFabricCanvas(backEl, null)

  useImperativeHandle(ref, () => ({
    getActiveCanvas: () => activePage === 'front' ? frontFabric.current : backFabric.current,
    getFrontCanvas: () => frontFabric.current,
    getBackCanvas: () => backFabric.current,
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
