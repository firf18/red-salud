# Flujo de Verificación de Médicos en Red-Salud

## 📋 Resumen del Proceso

El sistema de verificación de médicos en Red-Salud utiliza el SACS (Servicio Autónomo de Contraloría Sanitaria) de Venezuela para validar la identidad y credenciales profesionales de los médicos.

---

## 🔄 Flujo Completo

### **PASO 1: Verificación con SACS**

#### Interfaz
- Campo: **Tipo de Documento** (V - Venezolano / E - Extranjero)
- Campo: **Número de Cédula** (solo números, 6-10 dígitos)
- Botón: **Verificar Identidad**

#### Proceso Backend
1. Se envía la cédula a la Edge Function `verify-doctor-sacs`
2. La función consulta el SACS (actualmente mock con datos de prueba)
3. Valida que:
   - ✅ La cédula esté registrada en el SACS
   - ✅ Sea un médico de salud humana (NO veterinario)
   - ✅ Tenga una profesión válida para Red-Salud

#### Respuestas Posibles

**✅ Verificación Exitosa:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "cedula": "30218596",
    "tipo_documento": "V",
    "nombre_completo": "CARLOS RODRIGUEZ MARTINEZ",
    "profesion_principal": "MEDICO CIRUJANO",
    "matricula_principal": "MPPS-123456",
    "especialidad_display": "Cardiología",
    "es_medico_humano": true,
    "tiene_postgrados": true,
    "profesiones": [...],
    "postgrados": [...]
  }
}
```

**❌ Cédula No Encontrada:**
```json
{
  "success": false,
  "verified": false,
  "message": "No se encontró registro en el SACS para esta cédula"
}
```

**❌ Médico Veterinario:**
```json
{
  "success": false,
  "verified": false,
  "message": "Esta cédula corresponde a un médico veterinario. Red-Salud es solo para profesionales de salud humana."
}
```

**❌ Profesión No Válida:**
```json
{
  "success": false,
  "verified": false,
  "message": "Esta profesión (LICENCIADO EN ENFERMERIA) no está habilitada en Red-Salud."
}
```

---

### **PASO 2: Completar Perfil Profesional**

Una vez verificado exitosamente, el médico pasa al segundo paso donde:

#### Datos Verificados (NO EDITABLES) 🔒
Estos datos vienen del SACS y **NO se pueden modificar**:

- **Nombre Completo**: Tal como aparece en el SACS
- **Cédula**: Tipo + Número
- **Profesión Principal**: Ej. "MEDICO CIRUJANO"
- **Matrícula Profesional**: Ej. "MPPS-123456"
- **Postgrados**: Lista de especializaciones registradas

#### Datos a Completar por el Médico ✏️

1. **Especialidad en Red-Salud** (Requerido)
   - Selector con especialidades disponibles en la plataforma
   - Puede ser diferente a la del SACS (el médico elige cómo quiere aparecer)

2. **Teléfono Profesional** (Opcional)
   - Para contacto con pacientes

3. **Email Profesional** (Opcional)
   - Email de consultorio/clínica

4. **Biografía Profesional** (Opcional)
   - Máximo 500 caracteres
   - Descripción de experiencia y enfoque

#### Proceso de Guardado

Al hacer clic en **"Completar Registro"**:

1. **Se guarda en `doctor_details`:**
```sql
INSERT INTO doctor_details (
  profile_id,
  especialidad_id,
  licencia_medica,
  biografia,
  verified
) VALUES (
  user_id,
  specialty_id_seleccionado,
  matricula_del_sacs,
  biografia_ingresada,
  true
);
```

2. **Se actualiza `profiles`:**
```sql
UPDATE profiles SET
  nombre_completo = nombre_del_sacs,
  cedula = cedula_verificada,
  licencia_medica = matricula_del_sacs,
  especialidad = especialidad_del_sacs,
  cedula_verificada = true,
  sacs_verificado = true,
  sacs_nombre = nombre_del_sacs,
  sacs_matricula = matricula_del_sacs,
  sacs_especialidad = especialidad_del_sacs,
  sacs_fecha_verificacion = NOW()
WHERE id = user_id;
```

3. **Se guarda en `verificaciones_sacs`:**
```sql
INSERT INTO verificaciones_sacs (
  user_id,
  cedula,
  tipo_documento,
  nombre_completo,
  profesion_principal,
  matricula_principal,
  especialidad,
  profesiones,
  postgrados,
  es_medico_humano,
  verificado,
  apto_red_salud
) VALUES (...);
```

4. **Redirección:**
   - El médico es redirigido a `/dashboard/medico`
   - Ya puede usar todas las funcionalidades de la plataforma

---

## 🔐 Seguridad y Validaciones

### Protecciones Implementadas

1. **RLS (Row Level Security):**
   - Los usuarios solo pueden ver sus propias verificaciones
   - Solo el service role puede insertar verificaciones

2. **Datos Inmutables:**
   - Una vez verificado, el nombre y cédula NO se pueden cambiar
   - Si el médico intenta acceder a `/dashboard/medico/perfil/setup` después de verificarse, es redirigido automáticamente

3. **Validaciones de Entrada:**
   - Cédula: solo números, 6-10 dígitos
   - Email: formato válido
   - Biografía: máximo 500 caracteres

4. **Índices de Base de Datos:**
   - `idx_verificaciones_sacs_user_id`
   - `idx_verificaciones_sacs_cedula`
   - `idx_verificaciones_sacs_apto`

---

## 🧪 Cédulas de Prueba

Para testing, usa estas cédulas en el sistema mock:

| Cédula | Nombre | Profesión | Resultado |
|--------|--------|-----------|-----------|
| `30218596` | CARLOS RODRIGUEZ MARTINEZ | Médico Cirujano + Cardiología | ✅ Aprobado |
| `17497542` | ANA MARTINEZ SILVA | Médico Cirujano | ✅ Aprobado |
| `7983901` | MARIA FERNANDEZ LOPEZ | Médico Veterinario | ❌ Rechazado |
| `15229045` | JOSE GARCIA PEREZ | Licenciado en Enfermería | ❌ Rechazado |

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO: Registro Médico                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              PASO 1: Verificación con SACS                   │
│  - Ingresa tipo documento (V/E)                              │
│  - Ingresa número de cédula                                  │
│  - Click "Verificar Identidad"                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           Edge Function: verify-doctor-sacs                  │
│  - Consulta SACS (mock)                                      │
│  - Valida profesión                                          │
│  - Valida que sea médico humano                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌───────────────────┐
    │   ❌ RECHAZADO    │     │   ✅ APROBADO     │
    │                   │     │                   │
    │ - No encontrado   │     │ - Datos del SACS  │
    │ - Veterinario     │     │ - Postgrados      │
    │ - Profesión no    │     │ - Matrícula       │
    │   válida          │     │                   │
    └───────────────────┘     └─────────┬─────────┘
                                        │
                                        ▼
                        ┌───────────────────────────┐
                        │  PASO 2: Completar Perfil │
                        │                           │
                        │  Datos NO Editables:      │
                        │  - Nombre completo 🔒     │
                        │  - Cédula 🔒              │
                        │  - Matrícula 🔒           │
                        │  - Profesión 🔒           │
                        │                           │
                        │  Datos a Completar:       │
                        │  - Especialidad ✏️        │
                        │  - Teléfono ✏️            │
                        │  - Email ✏️               │
                        │  - Biografía ✏️           │
                        └─────────┬─────────────────┘
                                  │
                                  ▼
                        ┌───────────────────────────┐
                        │  Guardar en Base de Datos │
                        │  - doctor_details         │
                        │  - profiles               │
                        │  - verificaciones_sacs    │
                        └─────────┬─────────────────┘
                                  │
                                  ▼
                        ┌───────────────────────────┐
                        │  Redirigir a Dashboard    │
                        │  /dashboard/medico        │
                        └───────────────────────────┘
```

---

## 🚀 Próximos Pasos

### Para Producción:
1. Reemplazar el mock con integración real al SACS
2. Implementar caché de verificaciones
3. Agregar logs de auditoría
4. Configurar rate limiting
5. Habilitar protección de contraseñas filtradas en Auth

### Mejoras Futuras:
- Verificación de documentos adicionales (título, certificados)
- Sistema de re-verificación periódica
- Notificaciones por email al completar verificación
- Dashboard de administración para revisar verificaciones

---

## 📞 Soporte

Para dudas sobre el proceso de verificación:
- Revisar logs en Supabase Edge Functions
- Consultar tabla `verificaciones_sacs` para historial
- Verificar políticas RLS si hay problemas de permisos
