import { useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { LoadingDots } from './LoadingDots'
import type { Message } from '../types'

interface ChatWindowProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
}

export function ChatWindow({ messages, onSendMessage, isLoading = false }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] gap-3">
                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-white">
                  <img src="/tano-avatar.png" alt="Tano" className="h-full w-full object-cover" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3">
                  <LoadingDots />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  )
}
