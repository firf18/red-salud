# 📁 Estructura del Sistema de Mensajería

## Árbol de Archivos

```
red-salud/
│
├── app/
│   └── dashboard/
│       └── paciente/
│           └── mensajeria/
│               └── page.tsx ⭐ Página principal
│
├── components/
│   ├── messaging/
│   │   ├── conversation-list.tsx      📋 Lista de conversaciones
│   │   ├── message-thread.tsx         💬 Hilo de mensajes
│   │   ├── message-input.tsx          ⌨️  Input para enviar
│   │   ├── new-conversation-dialog.tsx ➕ Modal nueva conversación
│   │   └── index.ts                   📦 Exportaciones
│   │
│   └── ui/
│       └── scroll-area.tsx            📜 Componente scroll
│
├── hooks/
│   └── use-messaging.ts               🪝 Hooks personalizados
│
├── lib/
│   └── supabase/
│       ├── types/
│       │   └── messaging.ts           📝 Tipos TypeScript
│       │
│       └── services/
│           └── messaging-service.ts   🔧 Servicios CRUD
│
├── supabase/
│   └── migrations/
│       └── 006_create_messaging_system.sql 🗄️ Migración
│
├── scripts/
│   ├── apply-messaging-migration.sql  🚀 Script instalación
│   └── seed-messaging-data.sql        🌱 Datos de prueba
│
└── docs/
    ├── sistema-mensajeria.md          📖 Documentación técnica
    ├── SETUP-MENSAJERIA.md            🔧 Guía instalación
    ├── RESUMEN-MENSAJERIA.md          📊 Resumen ejecutivo
    ├── CHECKLIST-MENSAJERIA.md        ✅ Lista verificación
    ├── API-MENSAJERIA-EJEMPLOS.md     💡 Ejemplos código
    ├── MVP-MENSAJERIA-COMPLETO.md     🎉 Resumen MVP
    └── ESTRUCTURA-MENSAJERIA.md       📁 Este archivo
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                              │
│                    (Paciente/Doctor)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PÁGINA PRINCIPAL                          │
│              /dashboard/paciente/mensajeria                  │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ ConversationList │         │  MessageThread   │         │
│  │                  │         │                  │         │
│  │  - Lista de      │         │  - Mensajes      │         │
│  │    conversaciones│         │  - Scroll auto   │         │
│  │  - Preview       │         │  - Avatares      │         │
│  │  - No leídos     │         │  - Timestamps    │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │           MessageInput                        │          │
│  │  - Input texto                                │          │
│  │  - Botón enviar                               │          │
│  │  - Shift+Enter                                │          │
│  └──────────────────────────────────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOOKS PERSONALIZADOS                      │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  useMessaging    │         │  useConversation │         │
│  │                  │         │                  │         │
│  │  - conversations │         │  - messages      │         │
│  │  - unreadCount   │         │  - sendMessage   │         │
│  │  - create        │         │  - realtime      │         │
│  │  - archive       │         │  - markAsRead    │         │
│  └──────────────────┘         └──────────────────┘         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS (API)                           │
│                messaging-service.ts                          │
│                                                              │
│  • getUserConversations()                                   │
│  • createConversation()                                     │
│  • getConversationMessages()                                │
│  • sendMessage()                                            │
│  • markMessagesAsRead()                                     │
│  • archiveConversation()                                    │
│  • subscribeToMessages() ⚡ Realtime                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                           │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │              PostgreSQL Database              │          │
│  │                                               │          │
│  │  ┌──────────────┐      ┌──────────────┐     │          │
│  │  │conversations │      │   messages   │     │          │
│  │  │              │      │              │     │          │
│  │  │ - patient_id │      │ - sender_id  │     │          │
│  │  │ - doctor_id  │◄─────┤ - content    │     │          │
│  │  │ - subject    │      │ - is_read    │     │          │
│  │  │ - status     │      │ - created_at │     │          │
│  │  └──────────────┘      └──────────────┘     │          │
│  │                                               │          │
│  │  🔒 Row Level Security (RLS)                 │          │
│  │  ⚡ Realtime Subscriptions                   │          │
│  │  📊 Optimized Indexes                        │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Creación de Conversación

```
1. Usuario hace clic en "Nueva Conversación"
   │
   ▼
2. NewConversationDialog se abre
   │
   ▼
3. Usuario selecciona doctor
   │
   ▼
4. Usuario escribe mensaje inicial
   │
   ▼
5. useMessaging.createConversation()
   │
   ▼
6. messaging-service.createConversation()
   │
   ├─► Verifica si existe conversación
   │
   ├─► Crea nueva conversación en BD
   │
   ├─► Inserta mensaje inicial
   │
   └─► Log de actividad
   │
   ▼
7. Conversación aparece en lista
   │
   ▼
8. Usuario puede enviar más mensajes
```

## Flujo de Envío de Mensaje

```
1. Usuario escribe mensaje
   │
   ▼
2. Presiona Enter o botón Enviar
   │
   ▼
3. MessageInput.handleSubmit()
   │
   ▼
4. useConversation.sendMessage()
   │
   ▼
5. messaging-service.sendMessage()
   │
   ├─► INSERT en tabla messages
   │
   ├─► Trigger actualiza last_message_at
   │
   └─► Realtime notifica a suscriptores
   │
   ▼
6. Mensaje aparece en ambos lados
   │
   ▼
7. Receptor ve notificación de no leído
   │
   ▼
8. Al abrir conversación, se marca como leído
```

## Flujo de Realtime

```
┌─────────────┐                    ┌─────────────┐
│  Usuario A  │                    │  Usuario B  │
│  (Paciente) │                    │   (Doctor)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ 1. Envía mensaje                │
       ├──────────────────────────────────┤
       │                                  │
       │ 2. INSERT en messages            │
       ├──────────────┐                   │
       │              ▼                   │
       │      ┌──────────────┐            │
       │      │   Supabase   │            │
       │      │   Realtime   │            │
       │      └──────┬───────┘            │
       │             │                    │
       │             │ 3. Notifica        │
       │             └────────────────────┤
       │                                  │
       │                                  ▼
       │              4. Mensaje aparece instantáneamente
       │                                  │
       │              5. Marca como leído │
       │◄─────────────────────────────────┤
       │                                  │
       ▼              6. Actualiza "Leído"│
   Indicador                              │
   "Leído"                                │
```

## Componentes y Responsabilidades

### 🎨 UI Components

| Componente | Responsabilidad | Props Principales |
|------------|----------------|-------------------|
| `ConversationList` | Mostrar lista de conversaciones | conversations, onSelect |
| `MessageThread` | Mostrar mensajes en formato chat | messages, currentUserId |
| `MessageInput` | Input para enviar mensajes | onSend, disabled |
| `NewConversationDialog` | Modal para crear conversación | onCreateConversation |

### 🪝 Hooks

| Hook | Responsabilidad | Returns |
|------|----------------|---------|
| `useMessaging` | Gestionar conversaciones | conversations, create, archive |
| `useConversation` | Gestionar mensajes | messages, sendMessage, realtime |

### 🔧 Services

| Función | Propósito | Params |
|---------|-----------|--------|
| `getUserConversations` | Obtener conversaciones | userId |
| `createConversation` | Crear nueva conversación | patientId, data |
| `sendMessage` | Enviar mensaje | userId, data |
| `markMessagesAsRead` | Marcar como leído | conversationId, userId |
| `subscribeToMessages` | Suscribir a realtime | conversationId, callback |

## Base de Datos

### Tablas

```sql
conversations
├── id (UUID, PK)
├── patient_id (UUID, FK → profiles)
├── doctor_id (UUID, FK → profiles)
├── appointment_id (UUID, FK → appointments)
├── subject (TEXT)
├── status (TEXT: active/archived/closed)
├── last_message_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

messages
├── id (UUID, PK)
├── conversation_id (UUID, FK → conversations)
├── sender_id (UUID, FK → profiles)
├── content (TEXT)
├── is_read (BOOLEAN)
├── read_at (TIMESTAMPTZ)
├── attachment_url (TEXT)
├── attachment_name (TEXT)
├── attachment_type (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### Índices

```sql
conversations:
  - idx_conversations_patient (patient_id)
  - idx_conversations_doctor (doctor_id)
  - idx_conversations_appointment (appointment_id)
  - idx_conversations_last_message (last_message_at DESC)

messages:
  - idx_messages_conversation (conversation_id)
  - idx_messages_sender (sender_id)
  - idx_messages_created (created_at DESC)
  - idx_messages_unread (is_read WHERE is_read = false)
```

### Triggers

```sql
1. conversations_updated_at
   - Actualiza updated_at en UPDATE

2. messages_update_conversation
   - Actualiza last_message_at cuando se crea mensaje
```

### RLS Policies

```sql
conversations:
  1. Patients can view their conversations
  2. Doctors can view their conversations
  3. Patients can create conversations
  4. Users can update their conversations

messages:
  1. Users can view their messages
  2. Users can create messages
  3. Users can update messages
```

## Tipos TypeScript

```typescript
// Principales interfaces

Conversation {
  id, patient_id, doctor_id, appointment_id,
  subject, status, last_message_at,
  patient?, doctor?, unread_count?, last_message?
}

Message {
  id, conversation_id, sender_id, content,
  is_read, read_at, attachment_*,
  sender?
}

CreateConversationData {
  doctor_id, appointment_id?, subject?,
  initial_message
}

SendMessageData {
  conversation_id, content,
  attachment_*?
}
```

## Estados de la Aplicación

### Estados de Conversación
- `active` - Conversación activa
- `archived` - Conversación archivada
- `closed` - Conversación cerrada

### Estados de Mensaje
- `is_read: false` - No leído
- `is_read: true` - Leído

### Estados de UI
- `loading` - Cargando datos
- `sending` - Enviando mensaje
- `error` - Error ocurrido

## Seguridad

### Capas de Seguridad

1. **Autenticación**: Supabase Auth
2. **Autorización**: Row Level Security
3. **Validación**: Zod schemas
4. **Sanitización**: Escape de HTML
5. **Rate Limiting**: Por implementar

### Políticas RLS

```
Paciente puede:
  ✅ Ver sus conversaciones
  ✅ Crear conversaciones
  ✅ Enviar mensajes en sus conversaciones
  ✅ Marcar mensajes como leídos
  ❌ Ver conversaciones de otros
  ❌ Modificar mensajes de otros

Doctor puede:
  ✅ Ver sus conversaciones
  ✅ Enviar mensajes en sus conversaciones
  ✅ Marcar mensajes como leídos
  ❌ Ver conversaciones de otros
  ❌ Crear conversaciones (solo pacientes)
```

## Performance

### Optimizaciones Implementadas

1. **Índices de BD**: 8 índices estratégicos
2. **Lazy Loading**: Carga bajo demanda
3. **Realtime**: Sin polling
4. **Memoization**: React.memo en componentes
5. **Debouncing**: En marcar como leído

### Métricas Objetivo

- Carga inicial: < 2s
- Envío mensaje: < 500ms
- Realtime latency: < 300ms
- Scroll suave: 60fps

## Escalabilidad

### Preparado para:

- ✅ Miles de conversaciones por usuario
- ✅ Cientos de mensajes por conversación
- ✅ Múltiples usuarios simultáneos
- ✅ Realtime a escala
- ✅ Adjuntos de archivos (preparado)

### Límites Actuales:

- Sin paginación de mensajes (cargar todos)
- Sin compresión de imágenes
- Sin límite de tamaño de mensaje

### Mejoras Futuras:

- Paginación infinita
- Compresión de adjuntos
- Cache de conversaciones
- Service Workers para offline

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
