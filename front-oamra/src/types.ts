export type MessageRole = 'user' | 'assistant'

export interface SourceDocument {
  title: string
  uri: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  sources?: SourceDocument[]
}

export interface FaqCategory {
  title: string
  icon: string
  questions: string[]
}
