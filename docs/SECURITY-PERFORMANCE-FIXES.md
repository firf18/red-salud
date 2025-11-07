# Correcciones de Seguridad y Rendimiento

## Resumen

Esta migración corrige todos los problemas detectados por el linter de Supabase, mejorando la seguridad y el rendimiento de la base de datos.

## Problemas Corregidos

### 1. ERROR Crítico - Seguridad

#### RLS Deshabilitado en `lab_order_status_history`
- **Problema**: Tabla pública sin Row Level Security habilitado
- **Riesgo**: Cualquier usuario podría acceder a todo el historial de estados
- **Solución**: 
  - Habilitado RLS en la tabla
  - Agregadas políticas para que usuarios solo vean historial de sus propias órdenes

### 2. WARN - Seguridad (7 funciones)

#### Search Path Mutable en Funciones
- **Problema**: Funciones sin `search_path` fijo son vulnerables a ataques de escalación de privilegios
- **Funciones corregidas**:
  - `update_medications_updated_at()`
  - `update_health_metrics_updated_at()`
  - `update_telemedicine_updated_at()`
  - `calculate_session_duration()`
  - `calculate_wait_time()`
  - `update_verifications_updated_at()`
  - `update_updated_at_column()`
- **Solución**: Configurado `search_path = ''` en todas las funciones

### 3. WARN - Rendimiento (50+ políticas)

#### Re-evaluación de auth.uid() en RLS
- **Problema**: Llamadas a `auth.uid()` se re-evalúan para cada fila, causando bajo rendimiento
- **Impacto**: Consultas lentas en tablas con muchos registros
- **Solución**: Reemplazado `auth.uid()` con `(SELECT auth.uid())` en todas las políticas
- **Tablas optimizadas**:
  - profiles
  - patient_documents
  - user_activity_log
  - user_sessions
  - payment_methods
  - transactions
  - user_preferences
  - privacy_settings
  - notification_settings
  - prescriptions
  - prescription_medications
  - medication_reminders
  - medication_intake_log
  - health_metrics
  - health_goals
  - measurement_reminders
  - conversations
  - messages_new
  - lab_orders
  - lab_order_tests
  - lab_results
  - lab_result_values
  - telemedicine_sessions
  - telemedicine_participants
  - telemedicine_chat_messages
  - telemedicine_recordings
  - telemedicine_prescriptions
  - telemedicine_waiting_room

### 4. WARN - Rendimiento (Políticas Duplicadas)

#### Múltiples Políticas Permisivas
- **Problema**: Múltiples políticas para la misma acción causan evaluaciones redundantes
- **Solución**: Consolidadas políticas duplicadas en políticas únicas más eficientes
- **Ejemplos**:
  - `medication_reminders`: 2 políticas SELECT → 1 política ALL
  - `medication_intake_log`: 2 políticas SELECT → 1 política ALL
  - `prescriptions`: 2 políticas SELECT → 1 política SELECT combinada
  - `profiles`: Políticas duplicadas eliminadas

### 5. WARN - Rendimiento (Índices Duplicados)

#### Índice Duplicado en profiles.email
- **Problema**: Dos índices idénticos (`idx_profiles_email_unique` y `profiles_email_key`)
- **Impacto**: Espacio desperdiciado y escrituras más lentas
- **Solución**: Eliminado `idx_profiles_email_unique`, manteniendo la constraint única

## Mejoras de Rendimiento Esperadas

1. **Consultas RLS**: 30-50% más rápidas en tablas grandes
2. **Políticas consolidadas**: Menos evaluaciones por consulta
3. **Índices**: Menor uso de espacio y escrituras más rápidas
4. **Seguridad**: Protección contra ataques de escalación de privilegios

## Aplicar la Migración

### Opción 1: Usando Supabase CLI (Recomendado)

```bash
# Si tienes Supabase CLI configurado
supabase db push
```

### Opción 2: Usando el Script

```bash
# Asegúrate de tener las variables de entorno configuradas
npx tsx scripts/apply-security-fixes.ts
```

### Opción 3: Manual en Supabase Dashboard

1. Ve a SQL Editor en tu proyecto Supabase
2. Copia el contenido de `supabase/migrations/011_fix_security_and_performance_issues.sql`
3. Ejecuta el SQL

## Verificación Post-Migración

Después de aplicar la migración, verifica que:

1. ✅ No hay errores en el linter de Supabase
2. ✅ Las consultas RLS funcionan correctamente
3. ✅ Los usuarios solo pueden acceder a sus propios datos
4. ✅ Las funciones ejecutan sin errores

## Rollback

Si necesitas revertir los cambios, contacta al equipo de desarrollo. El rollback requiere recrear las políticas originales.

## Notas Importantes

- Esta migración es **segura** y no afecta datos existentes
- Solo modifica políticas de seguridad y configuraciones de funciones
- **No requiere downtime** de la aplicación
- Mejora la seguridad y el rendimiento sin cambios en el código de la aplicación

## Referencias

- [Supabase RLS Performance](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Function Security](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
