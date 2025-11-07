# Scraper SACS - Sistema de Consulta de Profesionales de la Salud

## 📋 Descripción

Este scraper automatiza la consulta de información de profesionales de la salud registrados en el **Servicio Autónomo de Contraloría Sanitaria (SACS)** de Venezuela.

**URL del sistema**: https://sistemas.sacs.gob.ve/consultas/prfsnal_salud

## 🚀 Características

- ✅ **Manejo automático de certificados SSL** - Bypass automático del warning "sitio no seguro"
- ✅ **Búsqueda por cédula** - Consulta únicamente con número de cédula venezolana
- ✅ **Extracción completa de datos** - Obtiene todas las profesiones, matrículas y registros
- ✅ **Procesamiento por lotes** - Puede procesar múltiples cédulas en una sola ejecución
- ✅ **Manejo de errores robusto** - Gestiona timeouts, errores de red y datos no encontrados
- ✅ **Exportación JSON** - Guarda resultados en archivos JSON con timestamp
- ✅ **Logging detallado** - Muestra progreso y resultados en tiempo real

## 📊 Datos Extraídos

Para cada cédula consultada, el scraper extrae:

```json
{
  "cedula": "7983901",
  "nombre": "Nombre del Profesional",
  "apellido": "Apellido del Profesional",
  "profesiones": [
    {
      "profesion": "MÉDICO CIRUJANO",
      "matricula": "12345",
      "fechaRegistro": "2020-01-15",
      "tomo": "ABC",
      "folio": "123"
    }
  ],
  "encontrado": true,
  "mensaje": "Encontradas 1 profesiones"
}
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 16+
- npm o yarn
- Sistema operativo: Windows, macOS o Linux

### Instalación de dependencias

```bash
npm install
```

Las dependencias necesarias ya están incluidas en `package.json`:
- `puppeteer` - Automatización del navegador
- `@types/puppeteer` - Tipos TypeScript
- `tsx` - Ejecutor de TypeScript

## 📖 Uso

### Uso Básico

```bash
# Procesar una sola cédula
npm run scrape-sacs 7983901

# Procesar múltiples cédulas
npm run scrape-sacs 7983901 12345678 87654321

# Procesar cédulas desde un archivo
npm run scrape-sacs $(cat cedulas.txt)
```

### Ejemplos de Salida

#### Cédula con registros encontrados:
```
🚀 Iniciando scraper SACS...
📋 Cédulas a procesar: 7983901

🔍 Buscando profesional con cédula: 7983901
✅ Tipo de búsqueda seleccionado: Cédula
✅ Nacionalidad seleccionada: Venezolano
✅ Cédula ingresada: 7983901
✅ Clic en "Consultar" realizado
📊 Resultado: Cédula encontrada pero sin registros profesionales activos

📋 RESULTADO:
{
  "cedula": "7983901",
  "profesiones": [],
  "encontrado": false,
  "mensaje": "Cédula encontrada pero sin registros profesionales activos"
}
```

#### Cédula con múltiples profesiones:
```
📊 Resultado: Encontradas 3 profesiones

📋 RESULTADO:
{
  "cedula": "12345678",
  "profesiones": [
    {
      "profesion": "MÉDICO CIRUJANO",
      "matricula": "12345",
      "fechaRegistro": "2015-03-20",
      "tomo": "ABC",
      "folio": "123"
    },
    {
      "profesion": "PEDIATRA",
      "matricula": "67890",
      "fechaRegistro": "2018-07-10",
      "tomo": "DEF",
      "folio": "456"
    }
  ],
  "encontrado": true,
  "mensaje": "Encontradas 2 profesiones"
}
```

## 📁 Estructura de Archivos

```
scripts/
├── sacs-scraper.ts      # Clase principal del scraper
├── scrape-sacs.ts       # Script de línea de comandos
└── resultados-sacs-*.json  # Archivos de salida generados
```

## 🔧 Configuración Avanzada

### Modo Headless

Por defecto, el scraper ejecuta el navegador en modo visible para facilitar la depuración. Para producción:

```typescript
// En sacs-scraper.ts, línea ~23
this.browser = await puppeteer.launch({
  headless: true, // Cambiar a true para modo headless
  // ... otros argumentos
});
```

### Timeouts Personalizados

```typescript
// Ajustar timeouts según la velocidad de conexión
this.page.setDefaultTimeout(60000);      // 60 segundos
this.page.setDefaultNavigationTimeout(60000);
```

### Manejo de Rate Limiting

El scraper incluye pausas automáticas entre consultas para evitar sobrecargar el servidor:

```typescript
// Pausa de 1 segundo entre consultas (línea ~178)
await this.page.waitForTimeout(1000);
```

## 🐛 Solución de Problemas

### Error de Certificado SSL

**Síntoma**: `net::ERR_CERT_AUTHORITY_INVALID`

**Solución**: El scraper maneja automáticamente este error. Si persiste:
1. Verificar conexión a internet
2. Intentar nuevamente (puede ser temporal)

### Timeout en la Carga

**Síntoma**: `Navigation timeout`

**Solución**:
1. Verificar conexión a internet
2. Aumentar timeouts en la configuración
3. Reintentar la operación

### Error de Elemento No Encontrado

**Síntoma**: `Selector not found`

**Solución**: El sitio SACS puede haber cambiado su estructura HTML. Revisar:
1. Cambios en los IDs de elementos
2. Cambios en la estructura del formulario
3. Actualizar selectores en el código

### Memoria Insuficiente

**Síntoma**: `Out of memory`

**Solución**:
```bash
# Ejecutar con más memoria
node --max-old-space-size=4096 scripts/scrape-sacs.ts
```

## 📋 Casos de Uso

### 1. Verificación de Credenciales Médicas

```typescript
import { SACSScraper } from './scripts/sacs-scraper';

const scraper = new SACSScraper();
await scraper.initialize();
await scraper.handleSSLCertificate();

const result = await scraper.searchProfessional('7983901');
if (result.encontrado && result.profesiones.length > 0) {
  console.log('✅ Profesional verificado');
} else {
  console.log('❌ Profesional no encontrado o sin registros activos');
}

await scraper.close();
```

### 2. Procesamiento Masivo

```typescript
const cedulas = ['11111111', '22222222', '33333333'];
const results = await scraper.scrapeMultipleCedulas(cedulas);

// Filtrar resultados válidos
const profesionalesActivos = results.filter(r => r.encontrado && r.profesiones.length > 0);
```

### 3. Integración con Base de Datos

```typescript
// Guardar resultados en Supabase
for (const result of results) {
  if (result.encontrado) {
    await supabase.from('profesionales_sacs').insert({
      cedula: result.cedula,
      profesiones: result.profesiones,
      verificado_en: new Date()
    });
  }
}
```

## ⚖️ Consideraciones Legales

- **Uso autorizado**: Este scraper está diseñado para consultas legítimas de verificación profesional
- **Rate limiting**: Incluye pausas automáticas para no sobrecargar el servidor público
- **Datos personales**: Manejar la información obtenida conforme a las leyes de protección de datos
- **Propiedad intelectual**: Los datos obtenidos son propiedad del SACS

## 🔄 Mantenimiento

### Actualizaciones del Sitio SACS

El sitio SACS puede cambiar su estructura HTML. Monitorear:
- Cambios en URLs
- Modificaciones en IDs de elementos
- Nuevos campos de seguridad
- Cambios en el flujo de consulta

### Versionado de Resultados

Los archivos de salida incluyen timestamp para tracking:
```
resultados-sacs-2024-01-15T10-30-45-123Z.json
```

## 🤝 Contribución

Para mejorar el scraper:

1. **Reportar cambios en el sitio**: Si el sitio SACS cambia, actualizar los selectores
2. **Mejoras de rendimiento**: Optimizar tiempos de espera y manejo de memoria
3. **Nuevas funcionalidades**: Agregar búsqueda por matrícula u otros criterios
4. **Manejo de errores**: Mejorar la robustez ante fallos de red

## 📞 Soporte

Para problemas o preguntas:
1. Verificar los logs detallados del scraper
2. Revisar la documentación de Puppeteer
3. Consultar cambios recientes en el sitio SACS

---

**Desarrollado para**: Sistema de Salud - Red Salud
**Versión**: 1.0.0
**Última actualización**: Diciembre 2024