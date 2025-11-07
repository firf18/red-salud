# Setup - Sistema de Mensajería

## Instalación Rápida

### 1. Aplicar Migración de Base de Datos

Opción A - Usando Supabase CLI:

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

Opción B - Manualmente en Supabase Dashboard:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a SQL Editor
3. Copia y pega el contenido de `scripts/apply-messaging-migration.sql`
4. Ejecuta el script

### 2. Verificar Instalación

Ejecuta este query en SQL Editor para verificar:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages');

-- Verificar RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages');

-- Debería retornar ambas tablas con rowsecurity = true
```

### 3. Probar el Sistema

1. Inicia el servidor de desarrollo:

```bash
npm run dev
```

2. Inicia sesión como paciente

3. Navega a `/dashboard/paciente/mensajeria`

4. Haz clic en "Nueva Conversación"

5. Selecciona un doctor y envía un mensaje de prueba

## Estructura de Archivos Creados

```
lib/supabase/
  types/
    messaging.ts                    # Tipos TypeScript
  services/
    messaging-service.ts            # Funciones CRUD

hooks/
  use-messaging.ts                  # Hooks React

components/
  messaging/
    conversation-list.tsx           # Lista de conversaciones
    message-thread.tsx              # Hilo de mensajes
    message-input.tsx               # Input para enviar
    new-conversation-dialog.tsx     # Modal nueva conversación

app/dashboard/paciente/
  mensajeria/
    page.tsx                        # Página principal

supabase/migrations/
  006_create_messaging_system.sql   # Migración

docs/
  sistema-mensajeria.md             # Documentación completa
  SETUP-MENSAJERIA.md              # Este archivo
```

## Características Implementadas

✅ Crear conversaciones con doctores
✅ Enviar y recibir mensajes
✅ Mensajes en tiempo real (Realtime)
✅ Marcar mensajes como leídos
✅ Contador de mensajes no leídos
✅ Archivar/reactivar conversaciones
✅ Asociar conversaciones con citas
✅ Interfaz estilo chat moderno
✅ Responsive design
✅ Seguridad con RLS

## Próximos Pasos

### Funcionalidades Pendientes

- [ ] Adjuntar archivos (requiere configurar Supabase Storage)
- [ ] Notificaciones push
- [ ] Búsqueda en mensajes
- [ ] Emojis y reacciones
- [ ] Indicador "escribiendo..."

### Para Implementar Adjuntos

1. Configurar bucket en Supabase Storage:

```sql
-- Crear bucket para adjuntos de mensajes
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false);

-- Política para subir archivos
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para descargar archivos
CREATE POLICY "Users can download their message attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.attachment_url = storage.objects.name
        AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())
    )
  )
);
```

2. Actualizar `MessageInput` para incluir upload de archivos

3. Actualizar `MessageThread` para mostrar previews de archivos

## Troubleshooting

### Error: "relation conversations does not exist"

**Solución:** La migración no se aplicó correctamente. Ejecuta el script SQL manualmente.

### Error: "new row violates row-level security policy"

**Solución:** Verifica que las políticas RLS estén creadas correctamente:

```sql
-- Ver políticas de conversations
SELECT * FROM pg_policies WHERE tablename = 'conversations';

-- Ver políticas de messages
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

### Los mensajes no aparecen en tiempo real

**Solución:** 

1. Verifica que Realtime esté habilitado en Supabase Dashboard
2. Ve a Database > Replication
3. Habilita replicación para las tablas `messages` y `conversations`

### No aparecen doctores en el selector

**Solución:** Asegúrate de tener doctores en la base de datos:

```sql
-- Verificar doctores
SELECT p.id, p.nombre_completo, p.role
FROM profiles p
WHERE p.role = 'doctor';

-- Si no hay, crear uno de prueba
INSERT INTO profiles (id, nombre_completo, email, role)
VALUES (
  gen_random_uuid(),
  'Dr. Juan Pérez',
  'doctor@test.com',
  'doctor'
);
```

## Soporte

Para más información, consulta:

- [Documentación Completa](./sistema-mensajeria.md)
- [Documentación de Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Documentación de RLS](https://supabase.com/docs/guides/auth/row-level-security)

## Notas de Desarrollo

- El sistema usa Supabase Realtime para actualizaciones instantáneas
- Los mensajes se marcan automáticamente como leídos al abrir la conversación
- Las conversaciones se ordenan por último mensaje
- El scroll automático va al último mensaje
- Soporte para Shift+Enter en el input de mensajes
