import React, { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import CanvasArea from './components/CanvasArea'
import { FONT_PRESETS, loadGoogleFont } from './utils/fontPresets'

export default function App() {
  const [activePage, setActivePage] = useState('front')
  const [frontImageURL, setFrontImageURL] = useState(null)
  const [selectedFont, setSelectedFont] = useState('Caveat')
  const [customFonts, setCustomFonts] = useState([])
  const [fontSize, setFontSize] = useState(16)
  const [textColor, setTextColor] = useState('#1a1a2e')
  const canvasRef = useRef(null)

  useEffect(() => {
    FONT_PRESETS.forEach(f => loadGoogleFont(f))
  }, [])

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
      />
      <CanvasArea
        ref={canvasRef}
        activePage={activePage}
        frontImageURL={frontImageURL}
      />
    </div>
  )
}
