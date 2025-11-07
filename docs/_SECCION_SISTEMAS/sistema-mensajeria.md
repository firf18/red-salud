# Sistema de Mensajería - Red-Salud

## Descripción General

Sistema de mensajería segura entre pacientes y doctores que permite comunicación directa relacionada con consultas médicas y seguimiento de tratamientos.

## Características Principales

### Para Pacientes

- ✅ Iniciar conversaciones con doctores
- ✅ Enviar mensajes de texto
- ✅ Ver historial de conversaciones
- ✅ Mensajes en tiempo real
- ✅ Indicadores de mensajes no leídos
- ✅ Archivar/reactivar conversaciones
- ✅ Asociar conversaciones con citas médicas
- 🔄 Adjuntar archivos (preparado, pendiente implementación de storage)

### Para Doctores

- ✅ Recibir mensajes de pacientes
- ✅ Responder consultas
- ✅ Ver historial de conversaciones
- ✅ Mensajes en tiempo real
- ✅ Gestionar múltiples conversaciones

## Estructura de Base de Datos

### Tabla: conversations

```sql
- id: UUID (PK)
- patient_id: UUID (FK -> profiles)
- doctor_id: UUID (FK -> profiles)
- appointment_id: UUID (FK -> appointments, opcional)
- subject: TEXT (opcional)
- status: TEXT (active, archived, closed)
- last_message_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Tabla: messages

```sql
- id: UUID (PK)
- conversation_id: UUID (FK -> conversations)
- sender_id: UUID (FK -> profiles)
- content: TEXT
- is_read: BOOLEAN
- read_at: TIMESTAMPTZ
- attachment_url: TEXT (opcional)
- attachment_name: TEXT (opcional)
- attachment_type: TEXT (opcional)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Seguridad (RLS)

### Conversations

- Pacientes pueden ver solo sus conversaciones
- Doctores pueden ver solo sus conversaciones
- Pacientes pueden crear nuevas conversaciones
- Ambos pueden actualizar el estado de sus conversaciones

### Messages

- Usuarios solo ven mensajes de sus conversaciones
- Usuarios solo pueden enviar mensajes en sus conversaciones
- Usuarios pueden actualizar mensajes (marcar como leído)

## Funcionalidades en Tiempo Real

El sistema utiliza Supabase Realtime para:

- Recibir nuevos mensajes instantáneamente
- Actualizar contadores de mensajes no leídos
- Sincronizar estado de lectura

## Componentes

### Hooks

- `useMessaging(userId)`: Gestiona lista de conversaciones
- `useConversation(conversationId, userId)`: Gestiona mensajes de una conversación

### Componentes UI

- `ConversationList`: Lista de conversaciones con preview
- `MessageThread`: Hilo de mensajes estilo chat
- `MessageInput`: Input para enviar mensajes
- `NewConversationDialog`: Modal para crear conversación

### Servicios

- `messaging-service.ts`: Funciones CRUD para conversaciones y mensajes

## Flujo de Uso

### Crear Nueva Conversación

1. Paciente hace clic en "Nueva Conversación"
2. Selecciona un doctor de la lista
3. Opcionalmente añade un asunto
4. Escribe mensaje inicial
5. Sistema crea conversación y envía primer mensaje

### Enviar Mensaje

1. Usuario escribe mensaje en el input
2. Presiona Enter o botón Enviar
3. Mensaje se guarda en BD
4. Trigger actualiza `last_message_at` en conversación
5. Realtime notifica al receptor
6. Mensaje aparece instantáneamente en ambos lados

### Marcar como Leído

1. Usuario abre conversación
2. Sistema automáticamente marca mensajes como leídos
3. Actualiza contador de no leídos
4. Emisor ve indicador "Leído"

## Próximas Mejoras

### Corto Plazo

- [ ] Adjuntar archivos (imágenes, PDFs)
- [ ] Notificaciones push
- [ ] Búsqueda en conversaciones
- [ ] Filtros por doctor/especialidad

### Mediano Plazo

- [ ] Mensajes de voz
- [ ] Videollamadas integradas
- [ ] Plantillas de respuestas rápidas
- [ ] Traducción automática

### Largo Plazo

- [ ] IA para sugerencias de respuesta
- [ ] Análisis de sentimiento
- [ ] Integración con expediente médico
- [ ] Mensajería grupal (paciente + equipo médico)

## Instalación

### 1. Ejecutar Migración

```bash
# Aplicar migración de base de datos
supabase db push
```

O ejecutar manualmente:

```sql
-- Ejecutar el contenido de:
supabase/migrations/006_create_messaging_system.sql
```

### 2. Verificar Políticas RLS

Asegurarse de que las políticas RLS estén activas:

```sql
-- Verificar RLS en conversations
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'conversations';

-- Verificar RLS en messages
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'messages';
```

### 3. Probar Funcionalidad

1. Iniciar sesión como paciente
2. Ir a `/dashboard/paciente/mensajeria`
3. Crear nueva conversación con un doctor
4. Enviar mensaje de prueba
5. Verificar que aparece en tiempo real

## Troubleshooting

### Los mensajes no aparecen en tiempo real

- Verificar que Realtime esté habilitado en Supabase
- Revisar políticas RLS en tabla `messages`
- Verificar conexión a internet

### No puedo crear conversación

- Verificar que existan doctores en la BD
- Revisar políticas RLS en tabla `conversations`
- Verificar que el usuario esté autenticado

### Mensajes no se marcan como leídos

- Verificar política UPDATE en tabla `messages`
- Revisar que `userId` sea correcto
- Verificar logs del navegador

## API Reference

### getUserConversations(userId)

Obtiene todas las conversaciones de un usuario.

**Returns:** `{ success, data: Conversation[], error }`

### createConversation(patientId, data)

Crea una nueva conversación.

**Params:**

- `patientId`: ID del paciente
- `data`: `CreateConversationData`

**Returns:** `{ success, data: { conversationId, message }, error }`

### sendMessage(userId, data)

Envía un mensaje en una conversación.

**Params:**

- `userId`: ID del usuario que envía
- `data`: `SendMessageData`

**Returns:** `{ success, data: Message, error }`

### markMessagesAsRead(conversationId, userId)

Marca mensajes como leídos.

**Returns:** `{ success, error }`

### subscribeToMessages(conversationId, onMessage)

Suscribe a nuevos mensajes en tiempo real.

**Returns:** Función para cancelar suscripción

## Notas Técnicas

- Los mensajes se ordenan por `created_at` ascendente
- Las conversaciones se ordenan por `last_message_at` descendente
- El scroll automático va al último mensaje al cargar
- Los mensajes propios se muestran a la derecha (azul)
- Los mensajes recibidos se muestran a la izquierda (gris)
- El avatar solo se muestra cuando cambia el remitente
- Soporte para Shift+Enter para nueva línea en input

## Mantenimiento

### Limpieza de Conversaciones Antiguas

```sql
-- Archivar conversaciones inactivas (>6 meses sin mensajes)
UPDATE conversations
SET status = 'archived'
WHERE last_message_at < NOW() - INTERVAL '6 months'
  AND status = 'active';
```

### Estadísticas de Uso

```sql
-- Mensajes por día (últimos 30 días)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as message_count
FROM messages
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Conversaciones activas por doctor
SELECT 
  d.nombre_completo,
  COUNT(*) as active_conversations
FROM conversations c
JOIN profiles d ON c.doctor_id = d.id
WHERE c.status = 'active'
GROUP BY d.id, d.nombre_completo
ORDER BY active_conversations DESC;
```
