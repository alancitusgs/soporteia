import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { cn } from '../lib/utils'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta sobre matrícula o trámites académicos..."
            disabled={isLoading}
            className={cn(
              'flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm',
              'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'rounded-lg bg-brand px-4 py-3 text-brand-foreground transition-colors',
              'hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
