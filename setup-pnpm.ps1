#!/usr/bin/env pwsh
# Setup script for pnpm configuration

Write-Host "🔧 Configurando proyecto para usar pnpm..." -ForegroundColor Cyan

# 1. Instalar pnpm globalmente
Write-Host "📦 Instalando pnpm globalmente..." -ForegroundColor Yellow
npm install -g pnpm@9.1.0

# 2. Verificar instalación
Write-Host "✓ Verificando instalación de pnpm..." -ForegroundColor Green
pnpm --version

# 3. Limpiar node_modules antiguos
Write-Host "🧹 Limpiando node_modules antiguos..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

# 4. Instalar dependencias con pnpm
Write-Host "📚 Instalando dependencias con pnpm..." -ForegroundColor Yellow
pnpm install

# 5. Verificar configuración
Write-Host "✓ Verificando configuración de pnpm..." -ForegroundColor Green
pnpm config list

Write-Host "✅ ¡Configuración completada!" -ForegroundColor Green
Write-Host "Ahora puedes usar: pnpm run lint" -ForegroundColor Cyan
