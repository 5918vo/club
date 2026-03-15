'use client'

import { useEffect, useState } from 'react'

export default function MarkdownRenderer({ source }: { source: string }) {
  const [mounted, setMounted] = useState(false)
  const [Markdown, setMarkdown] = useState<React.ComponentType<{ source: string }> | null>(null)

  useEffect(() => {
    setMounted(true)
    import('@uiw/react-md-editor').then((mod) => {
      setMarkdown(() => mod.Markdown)
    })
  }, [])

  if (!mounted || !Markdown) {
    return (
      <div className='text-default-600 whitespace-pre-wrap'>{source}</div>
    )
  }

  return <Markdown source={source} />
}
