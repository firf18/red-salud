# Sistema de Validación de Cédula

## Descripción

Este sistema implementa la validación automática de cédulas venezolanas usando la API de cedula.com.ve. Cuando un paciente ingresa su cédula en el perfil, el sistema automáticamente:

1. Valida el formato de la cédula (V-XXXXXXXX o E-XXXXXXXX)
2. Consulta la API de cedula.com.ve para verificar la identidad
3. Autocompleta el nombre completo del usuario
4. Guarda los datos del CNE (estado, municipio, parroquia, centro electoral)
5. Marca la cédula como verificada en la base de datos

## Credenciales API

- **APP-ID**: 1461
- **Access Token**: 96bc48c83b180e4529fe91c6700e98d3
- **Endpoint**: https://api.cedula.com.ve/api/v1

## Flujo de Validación

### 1. Usuario ingresa cédula

El usuario ingresa su cédula en el formato `V-12345678` o `E-12345678` en el campo de cédula del perfil.

### 2. Validación automática

Cuando el usuario sale del campo (evento `onBlur`), se dispara la validación:

```typescript
const handleCedulaBlur = () => {
  if (formData.cedula && isEditing) {
    handleCedulaValidation(formData.cedula);
  }
};
```

### 3. Consulta a la API

El componente hace una petición POST a `/api/validate-cedula`:

```typescript
const response = await fetch("/api/validate-cedula", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ nacionalidad, cedula }),
});
```

### 4. Respuesta de la API

La API retorna los datos del ciudadano:

```json
{
  "error": false,
  "data": {
    "nacionalidad": "V",
    "cedula": 12345678,
    "rif": "V-12345678-9",
    "nombreCompleto": "Juan Carlos Pérez González",
    "primerNombre": "Juan",
    "segundoNombre": "Carlos",
    "primerApellido": "Pérez",
    "segundoApellido": "González",
    "cne": {
      "estado": "Miranda",
      "municipio": "Chacao",
      "parroquia": "Chacao",
      "centroElectoral": "Escuela Básica Nacional"
    },
    "fechaConsulta": "2024-11-08"
  }
}
```

### 5. Autocompletado del formulario

El sistema autocompleta automáticamente:
- Nombre completo
- Datos CNE (estado, municipio, parroquia, centro electoral)
- RIF
- Nombres y apellidos separados

### 6. Guardado en base de datos

Al guardar el perfil, se almacenan todos los datos en la tabla `profiles`:

```sql
UPDATE profiles SET
  nombre_completo = 'Juan Carlos Pérez González',
  cedula = 'V-12345678',
  nacionalidad = 'V',
  rif = 'V-12345678-9',
  primer_nombre = 'Juan',
  segundo_nombre = 'Carlos',
  primer_apellido = 'Pérez',
  segundo_apellido = 'González',
  cne_estado = 'Miranda',
  cne_municipio = 'Chacao',
  cne_parroquia = 'Chacao',
  cne_centro_electoral = 'Escuela Básica Nacional',
  cedula_verificada = true
WHERE id = 'user-id';
```

## Campos en la Base de Datos

### Tabla `profiles`

Nuevos campos agregados:

- `nacionalidad` (VARCHAR(1)): 'V' o 'E'
- `rif` (VARCHAR(20)): RIF del usuario
- `primer_nombre` (VARCHAR(100)): Primer nombre
- `segundo_nombre` (VARCHAR(100)): Segundo nombre (opcional)
- `primer_apellido` (VARCHAR(100)): Primer apellido
- `segundo_apellido` (VARCHAR(100)): Segundo apellido (opcional)
- `cne_estado` (VARCHAR(100)): Estado según CNE
- `cne_municipio` (VARCHAR(100)): Municipio según CNE
- `cne_parroquia` (VARCHAR(100)): Parroquia según CNE
- `cne_centro_electoral` (VARCHAR(255)): Centro electoral según CNE
- `cedula_verificada` (BOOLEAN): Indica si la cédula fue verificada

## Archivos Modificados/Creados

### API Routes

1. **`app/api/validate-cedula/route.ts`**
   - Endpoint para validar cédulas
   - Consulta la API de cedula.com.ve
   - Retorna datos formateados

2. **`app/api/profile/update/route.ts`**
   - Endpoint para actualizar el perfil
   - Guarda todos los datos incluyendo CNE
   - Marca la cédula como verificada

3. **`app/api/profile/get/route.ts`**
   - Endpoint para obtener datos del perfil
   - Retorna todos los campos incluyendo CNE

### Componentes

1. **`components/dashboard/profile/tabs/profile-tab.tsx`**
   - Agregado campo de cédula con validación automática
   - Indicadores visuales de validación (loading, success, error)
   - Autocompletado de nombre al validar

2. **`components/dashboard/profile/user-profile-modal.tsx`**
   - Carga automática de datos del perfil al abrir
   - Guardado de datos con Supabase

3. **`components/dashboard/profile/types.ts`**
   - Agregados tipos para campos CNE

### Utilidades

1. **`lib/supabase/server.ts`**
   - Cliente de Supabase para server-side
   - Manejo de cookies para autenticación

### Migraciones

1. **`supabase/migrations/20241108000001_add_cne_fields.sql`**
   - Agrega campos CNE a la tabla profiles
   - Crea índice para búsquedas por cédula

## Indicadores Visuales

El campo de cédula muestra diferentes estados:

- **Idle**: Texto gris "Ingrese su cédula para validar automáticamente"
- **Validando**: Spinner animado
- **Éxito**: Checkmark verde + "✓ Cédula validada correctamente"
- **Error**: Ícono de alerta rojo + mensaje de error específico

## Manejo de Errores

Posibles errores y sus mensajes:

1. **Formato inválido**: "Formato inválido. Use V-12345678 o E-12345678"
2. **Cédula no encontrada**: "Cédula no encontrada en el sistema"
3. **Error de conexión**: "Error al conectar con el servicio de validación"
4. **Error del servidor**: "Error interno del servidor"

## Seguridad

- Las credenciales de la API están en el servidor (no expuestas al cliente)
- Solo usuarios autenticados pueden validar cédulas
- Los usuarios solo pueden actualizar su propio perfil
- Se registra la actividad de actualización de perfil

## Próximos Pasos

1. Implementar caché de validaciones para evitar consultas repetidas
2. Agregar rate limiting para prevenir abuso de la API
3. Implementar validación de cédula en el registro de usuarios
4. Agregar verificación de duplicados (misma cédula en múltiples cuentas)
