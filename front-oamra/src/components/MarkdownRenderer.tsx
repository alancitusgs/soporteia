import { Fragment } from 'react'

interface MarkdownRendererProps {
  content: string
}

type TextNode = {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link'
  content: string
  url?: string
}

function parseInlineMarkdown(text: string): TextNode[] {
  const nodes: TextNode[] = []
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\)|https?:\/\/[^\s<>"\)]+)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }

    const matched = match[0]
    if (matched.startsWith('**') && matched.endsWith('**')) {
      nodes.push({ type: 'bold', content: matched.slice(2, -2) })
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      nodes.push({ type: 'italic', content: matched.slice(1, -1) })
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      nodes.push({ type: 'code', content: matched.slice(1, -1) })
    } else if (matched.startsWith('[')) {
      const linkMatch = matched.match(/\[(.*?)\]\((.*?)\)/)
      if (linkMatch) {
        nodes.push({ type: 'link', content: linkMatch[1], url: linkMatch[2] })
      }
    } else if (matched.startsWith('http')) {
      nodes.push({ type: 'link', content: matched, url: matched })
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return nodes
}

function renderNodes(nodes: TextNode[]): React.ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'bold':
        return <strong key={index}>{node.content}</strong>
      case 'italic':
        return <em key={index}>{node.content}</em>
      case 'code':
        return (
          <code key={index} className="rounded bg-gray-100 px-1 py-0.5 text-sm">
            {node.content}
          </code>
        )
      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {node.content}
          </a>
        )
      default:
        return <Fragment key={index}>{node.content}</Fragment>
    }
  })
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Dividir por párrafos (doble salto de línea)
  const paragraphs = content.split(/\n\n+/)

  return (
    <div className="prose prose-sm max-w-none">
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim()
        if (trimmed === '') return null

        if (trimmed.startsWith('- ')) {
          return (
            <li key={index} className="ml-4 text-sm leading-relaxed">
              {renderNodes(parseInlineMarkdown(trimmed.slice(2)))}
            </li>
          )
        }

        return (
          <p key={index} className="text-sm leading-relaxed mb-3">
            {renderNodes(parseInlineMarkdown(trimmed))}
          </p>
        )
      })}
    </div>
  )
}
