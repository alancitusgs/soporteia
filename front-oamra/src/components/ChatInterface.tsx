import { useState, useCallback } from 'react'
import { ChatWindow } from './ChatWindow'
import { FaqSidebar } from './FaqSidebar'
import { ChatHeader } from './ChatHeader'
import { SatisfactionSurvey } from './SatisfactionSurvey'
import { useChat } from '../hooks/useChat'
import { useMobile } from '../hooks/useMobile'

export function ChatInterface() {
  const {
    messages,
    isLoading,
    sendMessage,
    sendFeedback,
    showSurvey,
    surveyTrigger,
    sendSurvey,
    closeSurvey,
    sessionId,
  } = useChat()
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

      <div className="flex flex-1 flex-col relative">
        <ChatHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          onSendFeedback={sendFeedback}
          isLoading={isLoading}
        />

        {/* Modal de encuesta de satisfaccion */}
        {showSurvey && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 animate-fade-in">
            <SatisfactionSurvey
              sessionId={sessionId}
              trigger={surveyTrigger}
              onSubmit={sendSurvey}
              onClose={closeSurvey}
            />
          </div>
        )}
      </div>
    </div>
  )
}
