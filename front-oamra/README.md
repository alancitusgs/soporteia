# Chatbot OAMRA - Soporte Técnico

Interfaz de chatbot con IA para la Universidad Peruana Cayetano Heredia (OAMRA). Asistente virtual "Tano" para soporte de matrícula y trámites académicos.

## Características

- ✨ Interfaz moderna y responsiva
- 🎨 Diseño institucional en colores OAMRA (rojo rgb(227, 17, 46))
- 💬 Burbujas de chat estilo WhatsApp
- 📋 Sidebar con preguntas frecuentes categorizadas
- 🦙 Avatar de Tano (mascota vicuña)
- 📱 Diseño mobile-first

## Tecnologías

- React 18 con TypeScript
- Vite
- Tailwind CSS
- Lucide React (iconos)
- Radix UI (componentes)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Build de Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`.

## Vista Previa del Build

```bash
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ChatInterface.tsx
│   ├── ChatHeader.tsx
│   ├── ChatWindow.tsx
│   ├── ChatMessage.tsx
│   ├── FaqSidebar.tsx
│   └── ui/             # Componentes UI base
├── lib/
│   └── utils.ts        # Utilidades
├── hooks/
│   └── useMobile.ts    # Hook para detectar mobile
├── types/
│   └── index.ts        # Tipos TypeScript
├── App.tsx             # Componente principal
├── main.tsx            # Entry point
└── index.css           # Estilos globales
```

## Licencia

Proyecto académico para OAMRA - UPCH
