# Sistema de Templates Estructurados - Mejorado

## 🎯 Descripción General

Sistema completo de templates médicos estructurados con más de 50 templates predefinidos y la capacidad de crear templates personalizados.

## ✨ Características Principales

### 1. **Biblioteca Extendida de Templates (50+ templates)**
- **Medicina General**: Consultas generales, primera vez, consultas rápidas
- **Control y Seguimiento**: Enfermedades crónicas, hipertensión, diabetes
- **Emergencias**: Atención general, dolor torácico, trauma
- **Pediatría**: Consultas pediátricas, control de niño sano
- **Ginecología**: Consultas ginecológicas, control prenatal
- **Especialidades**: Dermatología, Oftalmología, ORL, Traumatología, Psiquiatría, Neurología, Cardiología, Gastroenterología, Neumología, Urología, Endocrinología, Reumatología, Infectología
- **Quirúrgicos**: Evaluación preoperatoria, nota postoperatoria

### 2. **Creador de Templates Personalizados**
Los médicos pueden crear sus propios templates con:
- Nombre y descripción personalizados
- Categorización flexible
- Campos personalizables (textarea, input, signos vitales, medicamentos)
- Reordenamiento de campos con drag & drop
- Vista previa en tiempo real
- Guardado en localStorage

### 3. **Interfaz Mejorada**
- Modal más grande (95vw, 1400px max-width)
- Grid de 3 columnas en pantallas grandes
- Búsqueda avanzada por nombre, descripción, tags y especialidad
- Filtros por categoría (9 categorías)
- Vista previa detallada de cada template
- Indicadores visuales para templates personalizados

### 4. **Organización por Especialidades**
Cada template puede tener una especialidad asignada:
- Cardiología
- Pediatría
- Ginecología
- Dermatología
- Oftalmología
- Otorrinolaringología
- Traumatología
- Psiquiatría
- Neurología
- Gastroenterología
- Neumología
- Urología
- Endocrinología
- Reumatología
- Infectología
- Medicina Interna

## 📁 Estructura de Archivos

```
components/dashboard/medico/templates/
├── structured-template-marketplace.tsx  # Modal principal mejorado
├── custom-template-creator.tsx          # Creador de templates personalizados
└── README.md                            # Esta documentación

lib/templates/
├── structured-templates.ts              # Interfaces y tipos
├── extended-templates.ts                # Biblioteca de 50+ templates
└── template-library.ts                  # (deprecated)
```

## 🚀 Uso

### Abrir el Marketplace
```tsx
import { StructuredTemplateMarketplace } from '@/components/dashboard/medico/templates/structured-template-marketplace';

<StructuredTemplateMarketplace
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSelectTemplate={(template) => {
    // Usar el template seleccionado
    console.log(template);
  }}
/>
```

### Crear un Template Personalizado
1. Abrir el marketplace
2. Click en "Crear Template" en el footer
3. Completar información del template
4. Agregar campos uno por uno
5. Reordenar campos si es necesario
6. Guardar

### Buscar Templates
- Por nombre: "Consulta Pediátrica"
- Por especialidad: "Cardiología"
- Por tags: "emergencia", "control", "crónico"
- Por descripción: "evaluación rápida"

## 🎨 Categorías Disponibles

1. **Todos** - Muestra todos los templates
2. **General** - Consultas generales y medicina familiar
3. **Especialidad** - Templates específicos por especialidad
4. **Emergencia** - Atención urgente y emergencias
5. **Control** - Seguimiento de enfermedades crónicas
6. **Pediatría** - Consultas pediátricas
7. **Ginecología** - Salud femenina y obstetricia
8. **Quirúrgico** - Pre y postoperatorio
9. **Personalizados** - Templates creados por el usuario

## 💾 Almacenamiento

Los templates personalizados se guardan en `localStorage` con la key `customTemplates`.

```typescript
// Estructura de almacenamiento
{
  customTemplates: StructuredTemplate[]
}
```

## 🔧 Tipos de Campos

### textarea
Área de texto multilínea con filas configurables
```typescript
{
  type: 'textarea',
  rows: 3,
  placeholder: 'Texto de ayuda...'
}
```

### input
Campo de texto de una línea
```typescript
{
  type: 'input',
  placeholder: 'Ej: Control en 7 días'
}
```

### vitals
Campo especial para signos vitales
```typescript
{
  type: 'vitals',
  required: true
}
```

### medications
Campo especial para medicamentos con autocompletado
```typescript
{
  type: 'medications',
  required: false
}
```

## 🎯 Próximas Mejoras

- [ ] Compartir templates entre médicos
- [ ] Importar/Exportar templates
- [ ] Templates favoritos
- [ ] Estadísticas de uso
- [ ] Sincronización con backend
- [ ] Versionado de templates
- [ ] Templates por especialidad médica del usuario
- [ ] Sugerencias de templates basadas en el motivo de consulta

## 📝 Notas Técnicas

- Los templates del sistema no se pueden editar ni eliminar
- Los templates personalizados se pueden eliminar desde el marketplace
- La búsqueda es case-insensitive
- Los iconos se mapean dinámicamente desde lucide-react
- El color de cada template es configurable pero limitado a los colores de Tailwind

## 🐛 Solución de Problemas

### Los templates personalizados no se guardan
- Verificar que localStorage esté habilitado
- Verificar permisos del navegador
- Limpiar caché si es necesario

### El modal no se ve completo
- Verificar que el viewport sea suficientemente grande
- El modal es responsive y se adapta a pantallas pequeñas

### Los iconos no se muestran
- Verificar que el nombre del icono esté en el `iconMap`
- Agregar nuevos iconos al mapa si es necesario
