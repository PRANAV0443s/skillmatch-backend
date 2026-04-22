import { useState, useCallback } from 'react'
import { Upload, File, CheckCircle2, X } from 'lucide-react'
import './ResumeUploader.css'

export default function ResumeUploader({ onFileSelect, label = 'Upload Resume (PDF)' }) {
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.')
      return
    }
    setSelected(file)
    onFileSelect?.(file)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const clear = (e) => {
    e.stopPropagation()
    setSelected(null)
    onFileSelect?.(null)
  }

  return (
    <div
      className={`resume-dropzone ${dragging ? 'dragging' : ''} ${selected ? 'has-file' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !selected && document.getElementById('resume-input').click()}
    >
      <input
        id="resume-input"
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {selected ? (
        <div className="file-selected">
          <CheckCircle2 size={32} className="check-icon" />
          <div className="file-info">
            <p className="file-name"><File size={14} /> {selected.name}</p>
            <p className="file-size">{(selected.size / 1024).toFixed(1)} KB</p>
          </div>
          <button className="clear-btn" onClick={clear}><X size={16} /></button>
        </div>
      ) : (
        <div className="drop-content">
          <div className="upload-icon-wrap"><Upload size={28} /></div>
          <p className="drop-label">{label}</p>
          <p className="drop-hint">Drag & drop or <span className="browse-link">browse</span></p>
          <p className="drop-type">PDF only · max 5 MB</p>
        </div>
      )}
    </div>
  )
}
