import React from 'react'

export default function CodePanel({ text, onChange, onNewBlock }) {
  return (
    <div style={{
      width: 270, background: '#0f172a', borderLeft: '1px solid #1e293b',
      display: 'flex', flexDirection: 'column', padding: 12, gap: 8, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Code Editor
        </span>
        <button onClick={onNewBlock} style={{
          background: '#1d4ed8', border: 'none', color: 'white',
          borderRadius: 5, padding: '3px 10px', fontSize: 12, cursor: 'pointer',
        }}>
          + New Block
        </button>
      </div>

      {text !== null ? (
        <textarea
          value={text}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          placeholder="Paste or type your code here..."
          style={{
            flex: 1, background: '#1e293b', color: '#e2e8f0',
            border: '1px solid #334155', borderRadius: 6, padding: 10,
            fontSize: 12, fontFamily: 'ui-monospace, Consolas, monospace',
            resize: 'none', outline: 'none', lineHeight: 1.5,
          }}
        />
      ) : (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', color: '#475569', fontSize: 13, textAlign: 'center', gap: 12,
        }}>
          <span>Select a text box<br />or create a new block</span>
          <button onClick={onNewBlock} style={{
            background: '#1e3a5f', border: '1px solid #334155', color: '#93c5fd',
            borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
          }}>
            + New Code Block
          </button>
        </div>
      )}

      {text !== null && (
        <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>
          Edits sync live to canvas. Select a different box to switch.
        </p>
      )}
    </div>
  )
}
