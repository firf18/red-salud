# Perfil Médico Compartible

## Descripción

Sistema de perfil médico que permite a los pacientes visualizar y compartir su información médica con profesionales de salud de manera segura y controlada.

## Ubicación

- **Ruta del paciente**: `/dashboard/paciente/perfil`
- **Componente principal**: `components/dashboard/medical-profile-view.tsx`

## Características Implementadas

### 1. Vista de Perfil Médico

El perfil médico muestra información organizada en pestañas:

#### Pestaña: Información Médica
- **Información Básica**: Nombre, fecha de nacimiento, cédula, ciudad
- **Grupo Sanguíneo**: Tipo de sangre del paciente
- **Alergias**: Lista de alergias conocidas (destacadas en rojo)
- **Condiciones Médicas Crónicas**: Enfermedades crónicas registradas
- **Medicamentos Actuales**: Medicamentos que el paciente está tomando
- **Cirugías Previas**: Historial de procedimientos quirúrgicos
- **Contacto de Emergencia**: Información de contacto de emergencia

#### Pestaña: Documentos
- Lista de documentos médicos subidos (análisis, imágenes, informes)
- Fecha de subida y tipo de documento
- Botón para visualizar cada documento

#### Pestaña: Compartir (Solo para propietario)
- Funcionalidad para generar enlaces compartibles (próximamente)
- Gestión de permisos y accesos

### 2. Modos de Vista

- **Vista de Propietario** (`isOwner: true`): El paciente ve toda su información y puede compartir
- **Vista Compartida** (`isShared: true`): Vista limitada que oculta datos sensibles como:
  - Dirección completa
  - Teléfono personal
  - Email
  - Métodos de pago

## Datos Conectados

El componente utiliza los hooks existentes:
- `usePatientProfile(userId)`: Obtiene información del perfil y datos médicos
- `usePatientDocuments(userId)`: Obtiene documentos médicos del paciente

Los datos provienen de:
- Tabla `profiles`: Información básica del paciente
- Tabla `patient_details`: Información médica específica
- Tabla `patient_documents`: Documentos médicos subidos

## Próximas Funcionalidades

### Sistema de Compartir
1. **Generar enlaces temporales** con token único
2. **Código QR** para escanear en consulta presencial
3. **Compartir directo** a un doctor específico en la plataforma
4. **Tiempo de expiración** configurable
5. **Permisos granulares** sobre qué información mostrar
6. **Registro de accesos** con notificaciones al paciente

### Ruta Pública
- `/perfil-medico/[token]` o `/shared/medical-profile/[token]`
- Acceso sin login con token válido
- Vista limpia enfocada en información médica

## Uso

```typescript
// Vista del propietario (paciente)
<MedicalProfileView userId={userId} isOwner={true} />

// Vista compartida (para doctores)
<MedicalProfileView userId={userId} isOwner={false} isShared={true} />
```

## Componentes UI Utilizados

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Badge`: Para mostrar alergias, condiciones, grupo sanguíneo
- `Button`: Acciones como compartir y ver documentos
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: Organización en pestañas
- `Separator`: Divisores visuales
- Iconos de `lucide-react`

## Seguridad y Privacidad

- Control total del paciente sobre qué información compartir
- Enlaces temporales con expiración
- Registro de todos los accesos al perfil
- Datos sensibles ocultos en vistas compartidas
- Cumplimiento con regulaciones de privacidad (GDPR/LOPD)
