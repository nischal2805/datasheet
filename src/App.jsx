import React, { useState, useRef, useEffect, useCallback } from 'react'
import { fabric } from 'fabric'
import Sidebar from './components/Sidebar'
import CanvasArea from './components/CanvasArea'
import CodePanel from './components/CodePanel'
import { FONT_PRESETS, loadGoogleFont } from './utils/fontPresets'

export default function App() {
  const [activePage, setActivePage] = useState('front')
  const [frontImageURL, setFrontImageURL] = useState(null)
  const [selectedFont, setSelectedFont] = useState('Caveat')
  const [customFonts, setCustomFonts] = useState([])
  const [fontSize, setFontSize] = useState(16)
  const [textColor, setTextColor] = useState('#1a1a2e')
  const [codePanelText, setCodePanelText] = useState(null)
  const [hasSelection, setHasSelection] = useState(false)
  const canvasRef = useRef(null)
  const selectedObjRef = useRef(null)

  useEffect(() => {
    FONT_PRESETS.forEach(f => loadGoogleFont(f))
  }, [])

  // Called by canvas whenever selection changes
  const handleSelectionChange = useCallback((info) => {
    selectedObjRef.current = info?.object ?? null
    setHasSelection(!!info)
    setCodePanelText(info ? info.text : null)
    if (info) {
      setSelectedFont(info.fontFamily || 'Caveat')
      setFontSize(info.fontSize || 16)
      setTextColor(typeof info.fill === 'string' ? info.fill : '#1a1a2e')
    }
  }, [])

  // Code panel textarea edit → live update canvas textbox
  const handleCodePanelChange = useCallback((text) => {
    setCodePanelText(text)
    const obj = selectedObjRef.current
    if (obj) {
      obj.set('text', text)
      canvasRef.current?.getActiveCanvas()?.renderAll()
    }
  }, [])

  // New code block — creates Textbox, links to code panel
  const handleNewCodeBlock = useCallback(() => {
    const canvas = canvasRef.current?.getActiveCanvas()
    if (!canvas) return
    const box = new fabric.Textbox('// paste your code here', {
      left: 20, top: 20,
      width: canvas.width - 40,
      fontFamily: selectedFont, fontSize, fill: textColor,
      lineHeight: 1.4,
      angle: +(Math.random() * 2 - 1).toFixed(1),
    })
    canvas.add(box)
    canvas.setActiveObject(box)
    canvas.renderAll()
    // Manually sync since programmatic setActiveObject may not fire event in time
    selectedObjRef.current = box
    setHasSelection(true)
    setCodePanelText(box.text)
  }, [selectedFont, fontSize, textColor])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>
      <Sidebar
        activePage={activePage} setActivePage={setActivePage}
        frontImageURL={frontImageURL} setFrontImageURL={setFrontImageURL}
        selectedFont={selectedFont} setSelectedFont={setSelectedFont}
        customFonts={customFonts} setCustomFonts={setCustomFonts}
        fontSize={fontSize} setFontSize={setFontSize}
        textColor={textColor} setTextColor={setTextColor}
        canvasRef={canvasRef}
        hasSelection={hasSelection}
      />
      <CanvasArea
        ref={canvasRef}
        activePage={activePage}
        frontImageURL={frontImageURL}
        onSelectionChange={handleSelectionChange}
      />
      <CodePanel
        text={codePanelText}
        onChange={handleCodePanelChange}
        onNewBlock={handleNewCodeBlock}
      />
    </div>
  )
}
