import type { FaqCategory, Message } from './types'

export const WELCOME_MESSAGE: Omit<Message, 'id' | 'timestamp'> = {
  role: 'assistant',
  content: `¡Hola! Soy **Tano**, tu asistente virtual de OAMRA. Estoy aquí para ayudarte con tus consultas sobre matrícula y trámites académicos de la Universidad Peruana Cayetano Heredia.

**Te puedo ayudar con:**
- 📋 Procesos de matrícula
- 💳 Información de pagos
- 📄 Trámites académicos
- 🏫 Servicios universitarios

¿En qué puedo asistirte hoy?`,
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Matrícula',
    icon: '📋',
    questions: [
      '¿Cuándo es el período de matrícula ordinaria 2026?',
      '¿Cómo accedo al Portal de Matrícula?',
      '¿Qué cursos debo matricular este ciclo?',
      '¿Puedo modificar mi matrícula después de inscribirme?',
    ],
  },
  {
    title: 'Pagos',
    icon: '💳',
    questions: [
      '¿Cuál es el monto de la matrícula?',
      '¿Qué métodos de pago están disponibles?',
      '¿Hay descuentos por pronto pago?',
      '¿Cómo solicito fraccionamiento de pago?',
    ],
  },
  {
    title: 'Trámites Académicos',
    icon: '📄',
    questions: [
      '¿Cómo solicito una constancia de matrícula?',
      '¿Cuál es el proceso para el retiro de curso?',
      '¿Cómo solicito una licencia de estudios?',
      '¿Dónde descargo mi récord académico?',
    ],
  },
  {
    title: 'Servicios Universitarios',
    icon: '🏫',
    questions: [
      '¿Cómo accedo a la biblioteca virtual?',
      '¿Qué servicios ofrece bienestar universitario?',
      '¿Cómo solicito apoyo psicológico?',
      '¿Dónde encuentro información sobre becas?',
    ],
  },
]
