# Edge Function: Verificación SACS

Esta Edge Function verifica médicos venezolanos mediante scraping de la página del SACS (Sistema de Atención al Ciudadano en Salud).

## Despliegue

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login en Supabase

```bash
supabase login
```

### 3. Link al proyecto

```bash
supabase link --project-ref TU_PROJECT_REF
```

### 4. Desplegar la función

```bash
supabase functions deploy verify-doctor-sacs
```

## Uso

### Desde el cliente

```typescript
const { data, error } = await supabase.functions.invoke('verify-doctor-sacs', {
  body: { cedula: '12345678' }
});

if (data?.verified) {
  console.log('Médico verificado:', data);
  // data contiene: cedula, nombre, apellido, especialidad, mpps, etc.
}
```

### Respuesta exitosa

```json
{
  "verified": true,
  "cedula": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "especialidad": "Medicina General",
  "mpps": "123456",
  "colegio": "Colegio Médico de Caracas",
  "estado": "Distrito Capital"
}
```

### Respuesta de error

```json
{
  "verified": false,
  "error": "No se encontró registro en SACS"
}
```

## Notas

- La función hace scraping de https://sistemas.sacs.gob.ve/consultas/prfsnal_salud
- Solo funciona para médicos venezolanos registrados en el SACS
- La verificación es instantánea
- Los datos son públicos y oficiales del gobierno venezolano

## Testing Local

```bash
supabase functions serve verify-doctor-sacs
```

Luego hacer una petición:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/verify-doctor-sacs' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"cedula":"12345678"}'
```
