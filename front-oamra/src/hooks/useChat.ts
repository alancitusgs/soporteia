import { useState, useCallback, useEffect, useRef } from 'react'
import { nanoid } from 'nanoid'
import type { Message, SourceDocument, Citation, FeedbackType } from '../types'
import { WELCOME_MESSAGE } from '../constants'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000 // 3 minutos

// Generar session_id único para la sesión
const SESSION_ID = nanoid()

function createMessage(
  content: string,
  role: Message['role'] = 'assistant',
  sources?: SourceDocument[],
  citations?: Citation[],
  interaccionId?: number,
  showSurvey?: boolean
): Message {
  return { id: nanoid(), role, content, timestamp: new Date(), sources, citations, interaccionId, feedback: null, showSurvey }
}

function createInitialMessage(): Message {
  return { id: nanoid(), ...WELCOME_MESSAGE, timestamp: new Date(), feedback: null }
}

interface ChatApiResponse {
  response: string
  sources?: SourceDocument[]
  citations?: Citation[]
  interaccion_id?: number
  show_survey?: boolean
}

async function sendToAPI(content: string, sessionId: string): Promise<Message> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, session_id: sessionId }),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data: ChatApiResponse = await response.json()
    return createMessage(data.response, 'assistant', data.sources, data.citations, data.interaccion_id, data.show_survey)
  } catch {
    return createMessage('Lo siento, no pude procesar tu solicitud. Por favor, intenta nuevamente.')
  }
}

async function sendFeedbackToAPI(
  interaccionId: number,
  tipoFeedback: 'like' | 'dislike',
  motivo?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interaccion_id: interaccionId,
        tipo_feedback: tipoFeedback,
        motivo: motivo,
      }),
    })

    if (!response.ok) return false

    const data = await response.json()
    return data.success
  } catch {
    return false
  }
}

async function sendSurveyToAPI(
  sessionId: string,
  calificacion: number,
  comentario?: string,
  trigger: 'gracias' | 'inactividad' | 'manual' = 'manual'
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/survey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        calificacion,
        comentario,
        trigger,
      }),
    })

    if (!response.ok) return false

    const data = await response.json()
    return data.success
  } catch {
    return false
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(() => [createInitialMessage()])
  const [isLoading, setIsLoading] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [surveyTrigger, setSurveyTrigger] = useState<'gracias' | 'inactividad' | 'manual'>('manual')
  const [surveySubmitted, setSurveySubmitted] = useState(false)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Resetear el temporizador de inactividad
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    // Solo iniciar si hay más de 1 mensaje (el usuario ha interactuado)
    if (messages.length > 1 && !surveySubmitted) {
      inactivityTimerRef.current = setTimeout(() => {
        if (!surveySubmitted) {
          setSurveyTrigger('inactividad')
          setShowSurvey(true)
        }
      }, INACTIVITY_TIMEOUT_MS)
    }
  }, [messages.length, surveySubmitted])

  // Iniciar/resetear timer cuando hay actividad
  useEffect(() => {
    resetInactivityTimer()

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [messages, resetInactivityTimer])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Resetear timer de inactividad
    resetInactivityTimer()

    const userMessage = createMessage(content.trim(), 'user')
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const response = await sendToAPI(content, SESSION_ID)

    setMessages((prev) => [...prev, response])
    setIsLoading(false)

    // Si la respuesta indica mostrar encuesta
    if (response.showSurvey && !surveySubmitted) {
      // Pequeño retraso para que el usuario vea la respuesta antes de la encuesta
      setTimeout(() => {
        setSurveyTrigger('gracias')
        setShowSurvey(true)
      }, 1000)
    }
  }, [resetInactivityTimer, surveySubmitted])

  const sendFeedback = useCallback(async (
    messageId: string,
    tipoFeedback: 'like' | 'dislike',
    motivo?: string
  ): Promise<boolean> => {
    const message = messages.find((m) => m.id === messageId)
    if (!message || !message.interaccionId) return false

    const success = await sendFeedbackToAPI(message.interaccionId, tipoFeedback, motivo)

    if (success) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedback: tipoFeedback as FeedbackType } : m
        )
      )
    }

    return success
  }, [messages])

  const sendSurvey = useCallback(async (
    calificacion: number,
    comentario?: string
  ): Promise<boolean> => {
    const success = await sendSurveyToAPI(SESSION_ID, calificacion, comentario, surveyTrigger)

    if (success) {
      setSurveySubmitted(true)
    }

    return success
  }, [surveyTrigger])

  const closeSurvey = useCallback(() => {
    setShowSurvey(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([createInitialMessage()])
    setSurveySubmitted(false)
    setShowSurvey(false)
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    sendFeedback,
    clearMessages,
    showSurvey,
    surveyTrigger,
    sendSurvey,
    closeSurvey,
    sessionId: SESSION_ID,
  }
}
