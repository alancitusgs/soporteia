export interface User {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'reportes'
  activo: boolean
  fecha_creacion: string
  ultimo_login: string | null
}

export interface AuthUser {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'reportes'
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export interface Stats {
  total_consultas: number
  consultas_contestadas: number
  consultas_no_contestadas: number
  tasa_exito: number
  tiempo_respuesta_promedio_ms: number | null
  consultas_hoy: number
  consultas_semana: number
}

export interface UnansweredQuestion {
  id: number
  pregunta: string
  fecha: string
  session_id: string | null
}

export interface SourceDocument {
  title: string
  uri: string
}

export interface ConversationLog {
  id: number
  session_id: string | null
  pregunta_usuario: string
  respuesta_tano: string
  es_no_contestada: boolean
  tiempo_respuesta_ms: number | null
  fecha: string
  fuentes: SourceDocument[] | null
}

export interface DailyStats {
  fecha: string
  consultas: number
}

export interface ExtendedStats {
  total_consultas: number
  consultas_contestadas: number
  consultas_no_contestadas: number
  tasa_exito: number
  tiempo_respuesta_promedio_ms: number | null
  consultas_hoy: number
  consultas_ayer: number
  tendencia_hoy_vs_ayer: number
  tasa_resolucion: number
}

export interface HourlyStats {
  hora: number
  consultas: number
}

export interface TopQuestion {
  pregunta: string
  conteo: number
  es_no_contestada: boolean
}

export interface KeywordCount {
  palabra: string
  frecuencia: number
}

export interface SimilarQuestionGroup {
  pregunta_representativa: string
  preguntas: string[]
  conteo: number
}

export interface PaginatedConversations {
  items: ConversationLog[]
  total: number
  page: number
  pages: number
  per_page: number
}

export interface SystemConfig {
  mensaje_bienvenida: string
  temperatura: string
  max_tokens: number
  auto_reindexacion: boolean
  notificaciones_email: boolean
  notificaciones_slack: boolean
  umbral_alertas: number
  fecha_actualizacion: string | null
}
