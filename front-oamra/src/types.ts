export type MessageRole = 'user' | 'assistant'

export interface SourceDocument {
  title: string
  uri: string
}

export interface Citation {
  start_index: number
  end_index: number
  source_index: number
}

export type FeedbackType = 'like' | 'dislike' | null

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  sources?: SourceDocument[]
  citations?: Citation[]
  interaccionId?: number
  feedback?: FeedbackType
  showSurvey?: boolean
}

export interface FaqCategory {
  title: string
  icon: string
  questions: string[]
}
