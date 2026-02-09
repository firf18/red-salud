# PNPM Configuration Guide

## ¿Qué es pnpm?

pnpm es un gestor de paquetes rápido y eficiente que es especialmente útil para monorepos. Este proyecto está configurado para usar pnpm en lugar de npm.

## Configuración del Proyecto

### Versión Requerida
- **pnpm**: 9.1.0
- **Node.js**: 18.17.0 o superior

### Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `pnpm-workspace.yaml` | Define los workspaces del monorepo |
| `package.json` | Declara `packageManager: pnpm@9.1.0` |
| `.pnpmfile.cjs` | Hooks para personalizar el comportamiento de pnpm |
| `.tool-versions` | Especifica versiones con asdf (opcional) |

## Instalación

### Opción 1: Usar npx (Recomendado en PowerShell)
```powershell
npx pnpm install
npx pnpm run lint
npx pnpm run dev
```

### Opción 2: Instalar pnpm globalmente
```powershell
npm install -g pnpm@9.1.0

# Luego verificar en una nueva terminal
pnpm --version
pnpm install
pnpm run lint
```

### Opción 3: Usar los scripts wrapper locales
```powershell
# En la raíz del proyecto
.\pnpm.ps1 install
.\pnpm.ps1 run lint
```

## Scripts Disponibles

```bash
# Desarrollo
npx pnpm run dev          # Inicia servidor de desarrollo web
pnpm run web:dev         # Inicia web específicamente
pnpm run tauri:dev       # Inicia Tauri desktop

# Build
npx pnpm run build       # Build del proyecto completo

# Linting
npx pnpm run lint        # Ejecuta ESLint en el proyecto

# Otros
npx pnpm install         # Instala dependencias
npx pnpm update          # Actualiza paquetes
```

## Estructura del Monorepo

```
packages/               # Paquetes compartidos
├── core/              # Lógica central
├── types/             # Definiciones de tipos TypeScript
└── ui/                # Componentes de UI

apps/                   # Aplicaciones
├── web/               # Aplicación web Next.js
├── desktop/           # Aplicaciones desktop (Tauri)
└── mobile/            # Aplicaciones móviles

services/              # Servicios independientes
├── bcv-rate/
├── rif-verification/
└── sacs-verification/
```

## Instalación Limpia

Si necesitas hacer una instalación limpia:

```bash
# Limpiar todas las dependencias instaladas
npx pnpm clean

# Eliminar lock file y reinstalar
npx pnpm install --force

# O eliminando los directorios manualmente
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .pnpm-store
npx pnpm install
```

## Troubleshooting

### Problema: "pnpm is not recognized"

**Solución 1**: Usar `npx pnpm` en lugar de solo `pnpm`
```powershell
npx pnpm run lint
```

**Solución 2**: Instalar globalmente y reiniciar PowerShell
```powershell
npm install -g pnpm@9.1.0
# Cierra PowerShell completamente y abre una nueva ventana
pnpm --version
```

**Solución 3**: Usar bash en lugar de PowerShell
```bash
bash
pnpm run lint
```

### Problema: Peer dependency warnings

Estos son advertencias normales y no impiden que el proyecto funcione. Se pueden resolver actualizando los paquetes conflictivos en el futuro.

## Ventajas de pnpm

- ✅ Instalación más rápida
- ✅ Mejor gestión de dependencias en monorepos
- ✅ Menor uso de disco (links simbólicos)
- ✅ Errores más claros con versiones de dependencias
- ✅ Mejor control de peer dependencies

## Referencias

- Documentación oficial: https://pnpm.io
- Workspaces: https://pnpm.io/workspaces
- CLI: https://pnpm.io/cli/install
