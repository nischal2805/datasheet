import React, { useRef } from 'react'
import { FONT_PRESETS, loadGoogleFont } from '../utils/fontPresets'
import { loadCustomFont } from '../hooks/useFontLoader'
import { exportPDF } from '../utils/exportPDF'

export default function Sidebar({
  activePage, setActivePage,
  frontImageURL, setFrontImageURL,
  selectedFont, setSelectedFont,
  customFonts, setCustomFonts,
  fontSize, setFontSize,
  textColor, setTextColor,
  canvasRef,
  hasSelection,   // true when a text box is selected
}) {
  const sheetInputRef = useRef(null)
  const fontInputRef = useRef(null)
  const allFonts = [...FONT_PRESETS, ...customFonts]

  const getCanvas = () => canvasRef.current?.getActiveCanvas()

  const applyToSelected = (props) => {
    const canvas = getCanvas()
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      // fabric ignores most style changes while in editing mode — exit first
      if (obj.isEditing) obj.exitEditing()
      obj.set(props)
      obj.setCoords()
      canvas.renderAll()
    }
  }

  const handleSheetUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFrontImageURL(URL.createObjectURL(file))
  }

  const handleFontUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const name = await loadCustomFont(file)
    setCustomFonts(prev => [...new Set([...prev, name])])
    setSelectedFont(name)
    applyToSelected({ fontFamily: name })
  }

  const handleAddTextBox = () => {
    canvasRef.current?.enterAddTextMode(selectedFont, fontSize, textColor)
  }

  const deleteSelected = () => {
    const canvas = getCanvas()
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj) {
      canvas.remove(obj)
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  const handleExport = () => {
    const front = canvasRef.current?.getFrontCanvas()
    const back = canvasRef.current?.getBackCanvas()
    if (front && back) exportPDF(front, back)
  }

  return (
    <div style={{
      width: 210, background: '#0f172a', borderRight: '1px solid #1e293b',
      display: 'flex', flexDirection: 'column', gap: 10, padding: 12,
      overflowY: 'auto', flexShrink: 0, height: '100vh',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <img src="/logo.svg" alt="" width={20} height={20} />
        <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 18 }}>HandSheet</span>
      </div>

      {/* Page tabs */}
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #334155' }}>
        {['front', 'back'].map(p => (
          <button key={p} onClick={() => setActivePage(p)} style={{
            flex: 1, padding: '6px 0', fontSize: 13, cursor: 'pointer', border: 'none',
            background: activePage === p ? '#2563eb' : 'transparent',
            color: activePage === p ? 'white' : '#94a3b8',
          }}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Front upload */}
      {activePage === 'front' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Front sheet</label>
          <input ref={sheetInputRef} type="file" accept="image/jpeg,image/png"
            style={{ display: 'none' }} onChange={handleSheetUpload} />
          <button onClick={() => sheetInputRef.current.click()} style={btn('#334155')}>
            {frontImageURL ? 'Change image' : 'Upload image'}
          </button>
          <button onClick={() => setFrontImageURL('/template.jpeg')} style={btn('#1e3a5f')}
            title="Uses /public/template.jpeg">
            Use RV template
          </button>
        </div>
      )}
      {activePage === 'back' && (
        <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
          Back is plain white — add text boxes below.
        </p>
      )}

      <hr style={{ borderColor: '#1e293b', margin: '2px 0' }} />

      {/* Text actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={handleAddTextBox} style={btn('#1d4ed8')}>
          + Add Text Box
        </button>
        <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>
          Click anywhere on canvas to place
        </p>
        <button onClick={deleteSelected} style={btn('#7f1d1d')}>Delete Selected</button>
      </div>

      <hr style={{ borderColor: '#1e293b', margin: '2px 0' }} />

      {/* Selection indicator */}
      <div style={{
        padding: '5px 8px', borderRadius: 6, fontSize: 11,
        background: hasSelection ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hasSelection ? '#f59e0b44' : '#1e293b'}`,
        color: hasSelection ? '#fbbf24' : '#475569',
      }}>
        {hasSelection ? '● Box selected — editing below' : '○ No box selected'}
      </div>

      {/* Font */}
      <div>
        <label style={labelStyle}>Font</label>
        <select value={selectedFont}
          onChange={async (e) => {
            const name = e.target.value
            if (FONT_PRESETS.includes(name)) await loadGoogleFont(name)
            setSelectedFont(name)
            applyToSelected({ fontFamily: name })
          }}
          style={input}>
          {allFonts.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Custom font upload */}
      <div>
        <label style={labelStyle}>Custom font (.ttf / .otf)</label>
        <input ref={fontInputRef} type="file" accept=".ttf,.otf"
          style={{ display: 'none' }} onChange={handleFontUpload} />
        <button onClick={() => fontInputRef.current.click()} style={btn('#334155')}>
          Upload font
        </button>
      </div>

      {/* Size */}
      <div>
        <label style={labelStyle}>Size</label>
        <input type="number" value={fontSize} min={6} max={72}
          onChange={(e) => {
            const val = Number(e.target.value)
            setFontSize(val)
            applyToSelected({ fontSize: val })
          }}
          style={input} />
      </div>

      {/* Color */}
      <div>
        <label style={labelStyle}>Color</label>
        <input type="color" value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value)
            applyToSelected({ fill: e.target.value })
          }}
          style={{ width: '100%', height: 34, borderRadius: 6, border: '1px solid #334155',
            background: '#1e293b', cursor: 'pointer', padding: 2 }} />
      </div>

      {/* Export */}
      <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #1e293b' }}>
        <button onClick={handleExport} style={{ ...btn('#1d4ed8'), fontWeight: 700, fontSize: 14 }}>
          Export PDF
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 11, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
}
const input = {
  width: '100%', padding: '5px 8px', fontSize: 13, borderRadius: 6,
  border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', outline: 'none',
}
const btn = (bg) => ({
  width: '100%', padding: '7px 0', fontSize: 13, borderRadius: 6,
  border: 'none', background: bg, color: '#e2e8f0', cursor: 'pointer',
})
