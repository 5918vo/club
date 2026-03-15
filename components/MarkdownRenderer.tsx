'use client'

import { useEffect, useState } from 'react'

export default function MarkdownRenderer({ source }: { source: string }) {
  const [mounted, setMounted] = useState(false)
  const [Markdown, setMarkdown] = useState<React.ComponentType<{ source: string }> | null>(null)

  useEffect(() => {
    setMounted(true)
    import('@uiw/react-md-editor').then((mod) => {
      const MarkdownComponent = (mod as unknown as { Markdown: React.ComponentType<{ source: string }> }).Markdown
      setMarkdown(() => MarkdownComponent)
    })
  }, [])

  if (!mounted || !Markdown) {
    return (
      <div className='text-default-600 whitespace-pre-wrap'>{source}</div>
    )
  }

  return <Markdown source={source} />
}
