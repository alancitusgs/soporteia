import { useState, useCallback } from 'react'
import { ChatWindow } from './ChatWindow'
import { FaqSidebar } from './FaqSidebar'
import { ChatHeader } from './ChatHeader'
import { useChat } from '../hooks/useChat'
import { useMobile } from '../hooks/useMobile'

export function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMobile()

  const handleQuestionClick = useCallback(
    (question: string) => {
      sendMessage(question)
      if (isMobile) setIsSidebarOpen(false)
    },
    [sendMessage, isMobile]
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <FaqSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onQuestionClick={handleQuestionClick}
      />

      <div className="flex flex-1 flex-col">
        <ChatHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <ChatWindow messages={messages} onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
