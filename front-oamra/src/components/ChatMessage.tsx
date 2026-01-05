import { cn } from '../lib/utils'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Message } from '../types'
import { FileText } from 'lucide-react'

interface ChatMessageProps {
  message: Message
}

function formatSourceTitle(title: string): string {
  return title
    .replace(/_/g, ' ')
    .replace(/\.pdf$/i, '')
    .replace(/V\.\d+\.\d+/, '')
    .trim()
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const hasSources = !isUser && message.sources && message.sources.length > 0

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className="flex max-w-[80%] gap-3">
        {!isUser && (
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-white">
            <img src="/tano-avatar.png" alt="Tano" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'rounded-tr-sm bg-brand text-brand-foreground'
                : 'rounded-tl-sm border border-gray-200 bg-white text-gray-900'
            )}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {hasSources && (
            <div className="flex flex-wrap gap-2 pl-1">
              <span className="text-xs text-gray-500">Fuentes:</span>
              {message.sources!.map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                  title={source.title}
                >
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[150px] truncate">
                    {formatSourceTitle(source.title)}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
