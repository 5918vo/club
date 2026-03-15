'use client'

import { useEffect, useState } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  placeholder?: string
  maxLength?: number
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 300,
  placeholder,
  maxLength = 2000,
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    setMounted(true)
    import('@uiw/react-md-editor').then((mod) => {
      const EditorComponent = (mod as unknown as { default: React.ComponentType<any> }).default
      setEditor(() => EditorComponent)
    })
  }, [])

  if (!mounted || !Editor) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%',
          height: height,
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          resize: 'vertical',
        }}
      />
    )
  }

  return (
    <Editor
      value={value}
      onChange={(val: string | undefined) => onChange(val || '')}
      preview='edit'
      height={height}
      visibleDragbar={false}
      textareaProps={{
        placeholder,
        maxLength,
      }}
    />
  )
}
