import { useState } from 'react'
import { cn } from '../lib/utils'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Message } from '../types'
import { FileText, ThumbsUp, ThumbsDown, X, Send } from 'lucide-react'

interface ChatMessageProps {
  message: Message
  onSendFeedback: (messageId: string, tipo: 'like' | 'dislike', motivo?: string) => Promise<boolean>
}

function formatSourceTitle(title: string): string {
  return title
    .replace(/_/g, ' ')
    .replace(/\.pdf$/i, '')
    .replace(/V\.\d+\.\d+/, '')
    .trim()
}

const DISLIKE_REASONS = [
  'La respuesta no es precisa',
  'La informacion esta desactualizada',
  'No responde mi pregunta',
  'Es dificil de entender',
  'Otro motivo',
]

export function ChatMessage({ message, onSendFeedback }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const hasSources = !isUser && message.sources && message.sources.length > 0
  const canShowFeedback = !isUser && message.interaccionId

  const [showDislikeForm, setShowDislikeForm] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = async () => {
    if (message.feedback === 'like') return
    setIsSubmitting(true)
    await onSendFeedback(message.id, 'like')
    setIsSubmitting(false)
  }

  const handleDislikeClick = () => {
    if (message.feedback === 'dislike') return
    setShowDislikeForm(true)
  }

  const handleSubmitDislike = async () => {
    const motivo = selectedReason === 'Otro motivo' ? customReason : selectedReason
    if (!motivo.trim()) return

    setIsSubmitting(true)
    const success = await onSendFeedback(message.id, 'dislike', motivo)
    if (success) {
      setShowDislikeForm(false)
      setSelectedReason('')
      setCustomReason('')
    }
    setIsSubmitting(false)
  }

  const handleCancelDislike = () => {
    setShowDislikeForm(false)
    setSelectedReason('')
    setCustomReason('')
  }

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

          {canShowFeedback && (
            <div className="flex flex-col gap-2 pl-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">¿Te fue util?</span>
                <button
                  onClick={handleLike}
                  disabled={isSubmitting || message.feedback !== null}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all',
                    message.feedback === 'like'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600',
                    (isSubmitting || message.feedback !== null) && message.feedback !== 'like' && 'opacity-50 cursor-not-allowed'
                  )}
                  title="Me gusta"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDislikeClick}
                  disabled={isSubmitting || message.feedback !== null}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all',
                    message.feedback === 'dislike'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600',
                    (isSubmitting || message.feedback !== null) && message.feedback !== 'dislike' && 'opacity-50 cursor-not-allowed'
                  )}
                  title="No me gusta"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
                {message.feedback && (
                  <span className="text-xs text-gray-400 ml-1">Gracias por tu feedback</span>
                )}
              </div>

              {showDislikeForm && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">¿Por que no te gusto?</span>
                    <button
                      onClick={handleCancelDislike}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {DISLIKE_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setSelectedReason(reason)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs transition-colors',
                          selectedReason === reason
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        )}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  {selectedReason === 'Otro motivo' && (
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Describe el motivo..."
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300 resize-none"
                      rows={2}
                    />
                  )}

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitDislike}
                      disabled={isSubmitting || !selectedReason || (selectedReason === 'Otro motivo' && !customReason.trim())}
                      className={cn(
                        'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                        'bg-red-500 text-white hover:bg-red-600',
                        (isSubmitting || !selectedReason || (selectedReason === 'Otro motivo' && !customReason.trim())) && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Send className="h-3 w-3" />
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
