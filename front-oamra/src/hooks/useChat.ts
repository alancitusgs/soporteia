import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import type { Message, SourceDocument } from '../types'
import { WELCOME_MESSAGE } from '../constants'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function createMessage(
  content: string,
  role: Message['role'] = 'assistant',
  sources?: SourceDocument[]
): Message {
  return { id: nanoid(), role, content, timestamp: new Date(), sources }
}

function createInitialMessage(): Message {
  return { id: nanoid(), ...WELCOME_MESSAGE, timestamp: new Date() }
}

async function sendToAPI(content: string): Promise<Message> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content }),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    return createMessage(data.response, 'assistant', data.sources)
  } catch {
    return createMessage('Lo siento, no pude procesar tu solicitud. Por favor, intenta nuevamente.')
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(() => [createInitialMessage()])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage = createMessage(content.trim(), 'user')
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const response = await sendToAPI(content)

    setMessages((prev) => [...prev, response])
    setIsLoading(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([createInitialMessage()])
  }, [])

  return { messages, isLoading, sendMessage, clearMessages }
}
