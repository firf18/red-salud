# 🏥 Sistema de Verificación SACS - Documentación Completa

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  /dashboard/medico/perfil/setup                                 │
│  - Formulario con selector V/E                                  │
│  - Validación de cédula                                         │
│  - Manejo de estados (loading, success, error)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ verifyAndCreateDoctorProfile()
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVICIO FRONTEND (TypeScript)                      │
│  lib/supabase/services/doctor-verification-service.ts           │
│  - Verifica caché primero                                       │
│  - Llama a Edge Function                                        │
│  - Crea perfil en doctor_details                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ supabase.functions.invoke()
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              EDGE FUNCTION (Deno/TypeScript)                     │
│  supabase/functions/verify-doctor-sacs/index.ts                 │
│  - Validaciones de entrada                                      │
│  - Llama al servicio backend                                    │
│  - Guarda en caché automáticamente                              │
│  - Maneja errores robustamente                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP POST /verify
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVICIO BACKEND (Node.js + Puppeteer)             │
│  sacs-verification-service/index.js                             │
│  - Scraping del sitio SACS                                      │
│  - Extracción de datos estructurados                            │
│  - Validación de profesiones                                    │
│  - Filtro de veterinarios                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Web Scraping
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SACS (Sitio Web Externo)                      │
│  https://sistemas.sacs.gob.ve/consultas/prfsnal_salud          │
│  - Base de datos oficial de profesionales de salud             │
│  - Incluye médicos, veterinarios, enfermeros, etc.             │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ Datos extraídos
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (Supabase)                      │
│  - doctor_verifications_cache: Caché de verificaciones          │
│  - doctor_details: Perfiles de médicos verificados              │
│  - specialties: Especialidades médicas                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Verificación Completo

### 1️⃣ Usuario Ingresa Datos
```
Médico → Formulario
  ├─ Tipo: V (Venezolano) o E (Extranjero)
  └─ Cédula: 12345678
```

### 2️⃣ Validación Frontend
```
Validaciones:
  ✓ Cédula: 6-10 dígitos, solo números
  ✓ Tipo: V o E
  ✓ Campos requeridos
```

### 3️⃣ Verificación en Caché
```sql
SELECT * FROM doctor_verifications_cache
WHERE cedula = '12345678' 
  AND tipo_documento = 'V';
```

**Si existe en caché:**
- ✅ Retorna datos inmediatamente
- ⏱️ Tiempo: ~50ms

**Si NO existe:**
- ➡️ Continúa al siguiente paso

### 4️⃣ Consulta al SACS
```
Edge Function → Backend Service → SACS Website
  ├─ POST /verify
  ├─ Puppeteer abre navegador
  ├─ Completa formulario
  ├─ Extrae datos de tabla HTML
  └─ Retorna JSON estructurado
```

⏱️ Tiempo: ~5-10 segundos

### 5️⃣ Procesamiento de Datos
```javascript
Datos extraídos:
  ├─ Nombre completo
  ├─ Profesiones (array)
  │   ├─ Profesión
  │   ├─ Matrícula
  │   ├─ Fecha de registro
  │   └─ Tomo/Folio
  ├─ Postgrados (array)
  │   ├─ Especialidad
  │   ├─ Fecha
  │   └─ Tomo/Folio
  └─ Validaciones
      ├─ es_medico_humano: true/false
      ├─ es_veterinario: true/false
      └─ tiene_postgrados: true/false
```

### 6️⃣ Validación de Profesión
```javascript
if (es_veterinario) {
  return {
    verified: false,
    message: "Médico veterinario - no aplica para Red-Salud"
  };
}

if (!es_medico_humano) {
  return {
    verified: false,
    message: "Profesión no válida para Red-Salud"
  };
}

// ✅ Es médico humano válido
return {
  verified: true,
  data: { ... }
};
```

### 7️⃣ Guardado en Caché
```sql
INSERT INTO doctor_verifications_cache (
  cedula,
  tipo_documento,
  nombre_completo,
  profesiones,
  postgrados,
  profesion_principal,
  matricula_principal,
  especialidad_display,
  es_medico_humano,
  es_veterinario,
  tiene_postgrados,
  verified,
  verified_at,
  source
) VALUES (...);
```

### 8️⃣ Creación de Perfil
```sql
INSERT INTO doctor_details (
  profile_id,
  full_name,           -- NO EDITABLE
  document_type,       -- V o E
  document_number,     -- Cédula
  main_profession,     -- Del SACS
  license_number,      -- Matrícula principal
  display_specialty,   -- Sugerida por postgrados
  specialty_id,        -- Seleccionada por usuario
  is_verified,         -- true
  verified_at,         -- NOW()
  sacs_data            -- JSON completo
) VALUES (...);
```

### 9️⃣ Resultado Final

**✅ Éxito:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "cedula": "12345678",
    "tipo_documento": "V",
    "nombre_completo": "JUAN PEREZ GOMEZ",
    "profesion_principal": "MEDICO CIRUJANO",
    "matricula_principal": "123456",
    "especialidad_display": "Cardiología",
    "es_medico_humano": true,
    "es_veterinario": false,
    "tiene_postgrados": true,
    "profesiones": [...],
    "postgrados": [...]
  }
}
```

**❌ Veterinario:**
```json
{
  "success": false,
  "verified": false,
  "message": "Esta cédula corresponde a un médico veterinario. Red-Salud es solo para profesionales de salud humana."
}
```

**❌ No Encontrado:**
```json
{
  "success": false,
  "verified": false,
  "message": "No se encontró registro en el SACS para esta cédula"
}
```

---

## 📁 Estructura de Archivos

```
red-salud/
├── app/
│   └── dashboard/
│       └── medico/
│           └── perfil/
│               └── setup/
│                   └── page.tsx                    # ✅ Formulario de verificación
│
├── lib/
│   └── supabase/
│       └── services/
│           └── doctor-verification-service.ts     # ✅ Lógica de verificación
│
├── supabase/
│   ├── functions/
│   │   └── verify-doctor-sacs/
│   │       └── index.ts                           # ✅ Edge Function
│   │
│   └── migrations/
│       └── 010_create_doctor_verifications_cache.sql  # ✅ Migración DB
│
├── sacs-verification-service/
│   ├── index.js                                   # ✅ Servicio backend
│   ├── test.js                                    # ✅ Tests
│   ├── test-quick.js                              # ✅ Test rápido
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── DEPLOY-PASO-A-PASO.md                      # ✅ Guía de despliegue
│   ├── SISTEMA-VERIFICACION-COMPLETO.md           # ✅ Este archivo
│   └── README-VERIFICACION-MEDICOS.md
│
├── scripts/
│   ├── test-verification-flow.md                  # ✅ Guía de pruebas
│   └── verify-database-setup.sql                  # ✅ Verificación DB
│
└── DEPLOY-COMMANDS.md                             # ✅ Comandos rápidos
```

---

## 🎯 Casos de Uso

### Caso 1: Médico General (Sin Postgrados)
```
Input: V-12345678
SACS: MEDICO CIRUJANO
Postgrados: Ninguno
Resultado: ✅ APROBADO
Especialidad Sugerida: Medicina General
```

### Caso 2: Médico Especialista (Con Postgrados)
```
Input: V-87654321
SACS: MEDICO CIRUJANO
Postgrados: CARDIOLOGIA
Resultado: ✅ APROBADO
Especialidad Sugerida: Cardiología
```

### Caso 3: Médico Veterinario
```
Input: V-11111111
SACS: MEDICO VETERINARIO
Resultado: ❌ RECHAZADO
Razón: "Red-Salud es solo para salud humana"
```

### Caso 4: Enfermero/a
```
Input: V-22222222
SACS: LICENCIADO EN ENFERMERIA
Resultado: ❌ RECHAZADO
Razón: "Profesión no válida para Red-Salud"
```

### Caso 5: Cédula No Encontrada
```
Input: V-99999999
SACS: No encontrado
Resultado: ❌ ERROR
Razón: "No se encontró registro en el SACS"
```

---

## 🔒 Seguridad y Validaciones

### Frontend
- ✅ Validación de formato de cédula
- ✅ Tipo de documento requerido
- ✅ Rate limiting (prevenir spam)
- ✅ Sanitización de inputs

### Edge Function
- ✅ Validación de parámetros
- ✅ Autenticación con Supabase
- ✅ Manejo de errores robusto
- ✅ Timeouts configurables

### Backend
- ✅ Validación de formato
- ✅ Sanitización de datos extraídos
- ✅ Manejo de errores de scraping
- ✅ Logs detallados

### Base de Datos
- ✅ RLS (Row Level Security)
- ✅ Índices para performance
- ✅ Constraints de integridad
- ✅ Auditoría con timestamps

---

## 📊 Performance

### Tiempos Esperados

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| Verificación en caché | ~50ms | Instantáneo |
| Primera verificación | ~5-10s | Depende del SACS |
| Creación de perfil | ~200ms | Después de verificar |
| Total (primera vez) | ~6-11s | Incluye todo el flujo |
| Total (con caché) | ~300ms | Muy rápido |

### Optimizaciones

1. **Caché Inteligente**
   - Guarda resultados por 90 días
   - Evita consultas repetidas al SACS
   - Reduce carga en servidor externo

2. **Índices de Base de Datos**
   - `(cedula, tipo_documento)` - Búsqueda rápida
   - `verified_at` - Limpieza de caché antiguo

3. **Validación Temprana**
   - Formato de cédula en frontend
   - Evita llamadas innecesarias

---

## 🐛 Manejo de Errores

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "SACS not responding" | Sitio caído | Reintentar más tarde |
| "Puppeteer failed" | Falta Chromium | Instalar dependencias |
| "Invalid cedula format" | Formato incorrecto | Validar entrada |
| "Veterinarian detected" | Es veterinario | Rechazar con mensaje |
| "Cache error" | Problema de DB | Continuar sin caché |

---

## 📈 Monitoreo

### Métricas Clave

```sql
-- Verificaciones por día
SELECT 
  DATE(verified_at) as fecha,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE verified = true) as exitosas,
  COUNT(*) FILTER (WHERE es_veterinario = true) as veterinarios
FROM doctor_verifications_cache
WHERE verified_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(verified_at)
ORDER BY fecha DESC;

-- Tasa de éxito
SELECT 
  COUNT(*) FILTER (WHERE verified = true)::float / COUNT(*) * 100 as tasa_exito
FROM doctor_verifications_cache;

-- Profesiones más comunes
SELECT 
  profesion_principal,
  COUNT(*) as cantidad
FROM doctor_verifications_cache
WHERE es_medico_humano = true
GROUP BY profesion_principal
ORDER BY cantidad DESC;
```

---

## 🚀 Próximas Mejoras

### Corto Plazo
- [ ] Rate limiting por IP
- [ ] Notificaciones de verificación
- [ ] Dashboard de estadísticas
- [ ] Exportar certificado de verificación

### Mediano Plazo
- [ ] Verificación de otros países
- [ ] Integración con otros registros médicos
- [ ] Verificación automática periódica
- [ ] API pública de verificación

### Largo Plazo
- [ ] Machine learning para detección de fraudes
- [ ] Blockchain para certificados
- [ ] Integración con colegios médicos
- [ ] Sistema de badges verificados

---

## 📞 Soporte

### Documentación
- [Guía de Despliegue](./DEPLOY-PASO-A-PASO.md)
- [Comandos Rápidos](../DEPLOY-COMMANDS.md)
- [Guía de Pruebas](./test-verification-flow.md)

### Logs
```bash
# Edge Function
supabase functions logs verify-doctor-sacs --tail

# Backend
railway logs --tail  # o ver en dashboard
```

### Contacto
- GitHub Issues
- Email de soporte
- Slack del equipo

---

## ✅ Checklist de Producción

- [ ] Migración de DB aplicada
- [ ] Edge Function desplegada
- [ ] Backend en producción
- [ ] Variables de entorno configuradas
- [ ] Pruebas end-to-end pasadas
- [ ] Monitoreo configurado
- [ ] Logs funcionando
- [ ] Documentación actualizada
- [ ] Equipo capacitado
- [ ] Plan de rollback definido

---

**🎉 Sistema Completo y Listo para Producción!**
