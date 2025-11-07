# Ejemplos de Uso - API de Mensajería

## Importaciones

```typescript
import {
  getUserConversations,
  getConversation,
  createConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  archiveConversation,
  reactivateConversation,
  getUnreadMessagesCount,
  subscribeToMessages,
} from "@/lib/supabase/services/messaging-service";

import type {
  Conversation,
  Message,
  CreateConversationData,
  SendMessageData,
} from "@/lib/supabase/types/messaging";
```

## Ejemplos de Uso

### 1. Obtener Conversaciones de un Usuario

```typescript
const userId = "user-uuid-here";

const result = await getUserConversations(userId);

if (result.success) {
  console.log("Conversaciones:", result.data);
  // result.data es un array de Conversation[]
  
  result.data.forEach(conv => {
    console.log(`Conversación con: ${conv.doctor?.nombre_completo}`);
    console.log(`Mensajes no leídos: ${conv.unread_count}`);
    console.log(`Último mensaje: ${conv.last_message?.content}`);
  });
} else {
  console.error("Error:", result.error);
}
```

### 2. Crear Nueva Conversación

```typescript
const patientId = "patient-uuid-here";

const conversationData: CreateConversationData = {
  doctor_id: "doctor-uuid-here",
  subject: "Consulta sobre resultados de laboratorio",
  initial_message: "Hola doctor, tengo algunas dudas sobre mis análisis.",
};

const result = await createConversation(patientId, conversationData);

if (result.success) {
  console.log("Conversación creada:", result.data.conversationId);
  console.log("Mensaje inicial:", result.data.message);
} else {
  console.error("Error:", result.error);
}
```

### 3. Obtener Mensajes de una Conversación

```typescript
const conversationId = "conversation-uuid-here";

const result = await getConversationMessages(conversationId);

if (result.success) {
  console.log(`Total de mensajes: ${result.data.length}`);
  
  result.data.forEach(msg => {
    console.log(`[${msg.sender?.nombre_completo}]: ${msg.content}`);
    console.log(`Enviado: ${msg.created_at}`);
    console.log(`Leído: ${msg.is_read ? 'Sí' : 'No'}`);
  });
} else {
  console.error("Error:", result.error);
}
```

### 4. Enviar Mensaje

```typescript
const userId = "user-uuid-here";

const messageData: SendMessageData = {
  conversation_id: "conversation-uuid-here",
  content: "Gracias por la información, doctor.",
};

const result = await sendMessage(userId, messageData);

if (result.success) {
  console.log("Mensaje enviado:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### 5. Enviar Mensaje con Adjunto

```typescript
const messageData: SendMessageData = {
  conversation_id: "conversation-uuid-here",
  content: "Adjunto los resultados de laboratorio",
  attachment_url: "https://storage.supabase.co/...",
  attachment_name: "resultados-lab.pdf",
  attachment_type: "application/pdf",
};

const result = await sendMessage(userId, messageData);
```

### 6. Marcar Mensajes como Leídos

```typescript
const conversationId = "conversation-uuid-here";
const userId = "user-uuid-here";

const result = await markMessagesAsRead(conversationId, userId);

if (result.success) {
  console.log("Mensajes marcados como leídos");
} else {
  console.error("Error:", result.error);
}
```

### 7. Archivar Conversación

```typescript
const conversationId = "conversation-uuid-here";

const result = await archiveConversation(conversationId);

if (result.success) {
  console.log("Conversación archivada:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### 8. Reactivar Conversación

```typescript
const conversationId = "conversation-uuid-here";

const result = await reactivateConversation(conversationId);

if (result.success) {
  console.log("Conversación reactivada:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### 9. Obtener Conteo de Mensajes No Leídos

```typescript
const userId = "user-uuid-here";

const result = await getUnreadMessagesCount(userId);

if (result.success) {
  console.log(`Mensajes no leídos: ${result.data}`);
} else {
  console.error("Error:", result.error);
}
```

### 10. Suscribirse a Mensajes en Tiempo Real

```typescript
const conversationId = "conversation-uuid-here";

const unsubscribe = subscribeToMessages(
  conversationId,
  (newMessage: Message) => {
    console.log("Nuevo mensaje recibido:", newMessage);
    console.log(`De: ${newMessage.sender?.nombre_completo}`);
    console.log(`Contenido: ${newMessage.content}`);
    
    // Actualizar UI con el nuevo mensaje
    setMessages(prev => [...prev, newMessage]);
  }
);

// Cuando el componente se desmonte o ya no necesites la suscripción
// unsubscribe();
```

## Uso en Componentes React

### Hook Personalizado - useMessaging

```typescript
import { useMessaging } from "@/hooks/use-messaging";

function MyComponent() {
  const userId = "user-uuid-here";
  
  const {
    conversations,
    loading,
    error,
    unreadCount,
    refreshConversations,
    createConversation,
    archiveConversation,
    reactivateConversation,
  } = useMessaging(userId);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Mensajes no leídos: {unreadCount}</h2>
      {conversations.map(conv => (
        <div key={conv.id}>
          <h3>{conv.subject}</h3>
          <p>{conv.last_message?.content}</p>
        </div>
      ))}
    </div>
  );
}
```

### Hook Personalizado - useConversation

```typescript
import { useConversation } from "@/hooks/use-messaging";

function ChatComponent({ conversationId }: { conversationId: string }) {
  const userId = "user-uuid-here";
  
  const {
    conversation,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refreshMessages,
  } = useConversation(conversationId, userId);

  const handleSend = async (content: string) => {
    await sendMessage({
      conversation_id: conversationId,
      content,
    });
  };

  if (loading) return <div>Cargando mensajes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Chat con {conversation?.doctor?.nombre_completo}</h2>
      
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <strong>{msg.sender?.nombre_completo}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <input
        type="text"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        disabled={sending}
      />
    </div>
  );
}
```

## Ejemplos de Queries SQL Directas

### Obtener Conversaciones con Conteo de Mensajes

```sql
SELECT 
  c.*,
  COUNT(m.id) FILTER (WHERE m.is_read = false AND m.sender_id != 'user-id') as unread_count,
  (
    SELECT json_build_object(
      'id', m2.id,
      'content', m2.content,
      'created_at', m2.created_at
    )
    FROM messages m2
    WHERE m2.conversation_id = c.id
    ORDER BY m2.created_at DESC
    LIMIT 1
  ) as last_message
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.patient_id = 'user-id' OR c.doctor_id = 'user-id'
GROUP BY c.id
ORDER BY c.last_message_at DESC NULLS LAST;
```

### Buscar en Mensajes

```sql
SELECT 
  m.*,
  c.subject,
  p.nombre_completo as sender_name
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
JOIN profiles p ON m.sender_id = p.id
WHERE 
  (c.patient_id = 'user-id' OR c.doctor_id = 'user-id')
  AND m.content ILIKE '%búsqueda%'
ORDER BY m.created_at DESC
LIMIT 50;
```

### Estadísticas de Mensajería

```sql
-- Mensajes por día (últimos 30 días)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as message_count
FROM messages
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Conversaciones más activas
SELECT 
  c.id,
  c.subject,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM conversations c
JOIN messages m ON m.conversation_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.subject
ORDER BY message_count DESC
LIMIT 10;

-- Tiempo promedio de respuesta
SELECT 
  AVG(
    EXTRACT(EPOCH FROM (m2.created_at - m1.created_at))
  ) / 60 as avg_response_time_minutes
FROM messages m1
JOIN messages m2 ON m2.conversation_id = m1.conversation_id
WHERE 
  m1.sender_id != m2.sender_id
  AND m2.created_at > m1.created_at
  AND m2.created_at = (
    SELECT MIN(created_at)
    FROM messages
    WHERE conversation_id = m1.conversation_id
      AND sender_id != m1.sender_id
      AND created_at > m1.created_at
  );
```

## Manejo de Errores

```typescript
try {
  const result = await sendMessage(userId, messageData);
  
  if (!result.success) {
    // Manejar error específico
    if (result.error?.code === 'PGRST116') {
      console.error("No tienes permiso para enviar este mensaje");
    } else if (result.error?.code === '23503') {
      console.error("La conversación no existe");
    } else {
      console.error("Error desconocido:", result.error);
    }
  }
} catch (error) {
  console.error("Error de red o del servidor:", error);
}
```

## Best Practices

### 1. Siempre Verificar el Resultado

```typescript
const result = await getUserConversations(userId);

if (result.success) {
  // Usar result.data
} else {
  // Manejar result.error
}
```

### 2. Limpiar Suscripciones

```typescript
useEffect(() => {
  const unsubscribe = subscribeToMessages(conversationId, handleNewMessage);
  
  return () => {
    unsubscribe(); // Importante para evitar memory leaks
  };
}, [conversationId]);
```

### 3. Optimistic Updates

```typescript
const handleSend = async (content: string) => {
  // Agregar mensaje optimísticamente
  const tempMessage = {
    id: 'temp-' + Date.now(),
    content,
    sender_id: userId,
    created_at: new Date().toISOString(),
    // ... otros campos
  };
  
  setMessages(prev => [...prev, tempMessage]);
  
  try {
    const result = await sendMessage(userId, { conversation_id, content });
    
    if (result.success) {
      // Reemplazar mensaje temporal con el real
      setMessages(prev => 
        prev.map(m => m.id === tempMessage.id ? result.data : m)
      );
    } else {
      // Remover mensaje temporal si falla
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  } catch (error) {
    setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
  }
};
```

### 4. Debounce para Marcar como Leído

```typescript
import { useEffect, useRef } from 'react';

function useMarkAsRead(conversationId: string, userId: string) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Esperar 1 segundo antes de marcar como leído
    timeoutRef.current = setTimeout(() => {
      markMessagesAsRead(conversationId, userId);
    }, 1000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [conversationId, userId]);
}
```

## Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { sendMessage } from '@/lib/supabase/services/messaging-service';

describe('Messaging Service', () => {
  it('should send a message successfully', async () => {
    const userId = 'test-user-id';
    const messageData = {
      conversation_id: 'test-conv-id',
      content: 'Test message',
    };
    
    const result = await sendMessage(userId, messageData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.content).toBe('Test message');
  });
  
  it('should handle errors gracefully', async () => {
    const result = await sendMessage('invalid-id', {
      conversation_id: 'invalid',
      content: '',
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

**Nota:** Todos estos ejemplos asumen que tienes configurado correctamente Supabase y que las migraciones han sido aplicadas.
