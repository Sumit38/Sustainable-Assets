'use client'

import React, { useState } from 'react'
import { Upload, Check, AlertCircle, File } from 'lucide-react'

const templateLink =
  'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500'

interface ImportPanelProps {
  uploading: boolean
  success: string | null
  error: string | null
  onFile: (file: File) => void
}

export function ImportPanel({ uploading, success, error, onFile }: ImportPanelProps) {
  const [dragging, setDragging] = useState(false)

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
      {success && (
        <div className="bg-success-50 border border-success-500/30 rounded-lg p-3 flex gap-2 text-sm text-success-700">
          <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-danger-50 border border-danger-500/30 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-danger-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger-700 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <label
        htmlFor="csv-upload"
        onDragOver={e => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file && !uploading) onFile(file)
        }}
        className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Upload className="w-7 h-7 text-neutral-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-neutral-900">
          {uploading ? 'Processing…' : 'Drop your CSV here, or click to choose a file'}
        </p>
        <p className="text-xs text-neutral-500 mt-1">Uploading replaces your current asset data</p>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          disabled={uploading}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ''
          }}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
        <span>Need a template?</span>
        <a href="/Asset_Template.csv" download className={templateLink}>
          <File className="w-3.5 h-3.5" /> Basic
        </a>
        <a href="/Asset_Template_Extended.csv" download className={templateLink}>
          <File className="w-3.5 h-3.5" /> Extended
        </a>
        <span className="text-neutral-500">
          The Extended template adds employee, cost and CO₂e columns, which unlock the health and sustainability figures.
        </span>
      </div>
    </div>
  )
}
