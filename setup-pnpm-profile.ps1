#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Configura pnpm automáticamente en el perfil de PowerShell
.DESCRIPTION
    Este script agrega la función pnpm al perfil de PowerShell automáticamente
.EXAMPLE
    .\setup-pnpm-profile.ps1
#>

Write-Host "🔧 Configurando pnpm en PowerShell..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 1. Obtener la ruta del perfil
$profilePath = $PROFILE
$profileDir = Split-Path -Parent $profilePath

Write-Host "Perfil de PowerShell: $profilePath" -ForegroundColor Yellow

# 2. Crear el directorio del perfil si no existe
if (!(Test-Path -Path $profileDir)) {
    Write-Host "📁 Creando directorio del perfil..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

# 3. Crear o actualizar el perfil
$pnpmFunction = @'

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# pnpm Configuration - Auto-added by setup-pnpm-profile.ps1
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Function: Redirige pnpm a la instalación global correcta
function pnpm {
    & "C:\Users\Fredd\AppData\Roaming\npm\pnpm.cmd" @args
}

# Alias: Versión corta 'pn' para escribir menos
Set-Alias -Name pn -Value pnpm -Scope Global -Force

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
'@

# 4. Verificar si ya existe el perfil
if (Test-Path -Path $profilePath) {
    $profileContent = Get-Content -Path $profilePath -Raw
    
    if ($profileContent -like "*pnpm Configuration*") {
        Write-Host "✅ pnpm ya está configurado en tu perfil" -ForegroundColor Green
    }
    else {
        Write-Host "📝 Agregando pnpm a tu perfil existente..." -ForegroundColor Yellow
        Add-Content -Path $profilePath -Value $pnpmFunction
        Write-Host "✅ pnpm agregado al perfil" -ForegroundColor Green
    }
}
else {
    Write-Host "📝 Creando nuevo perfil de PowerShell..." -ForegroundColor Yellow
    Set-Content -Path $profilePath -Value $pnpmFunction
    Write-Host "✅ Perfil creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANTE: Debe cerrar PowerShell completamente" -ForegroundColor Yellow
Write-Host "   y abrir una NUEVA ventana para que los cambios" -ForegroundColor Yellow
Write-Host "   se apliquen correctamente." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Después de cerrar y reabrur PowerShell, verifica con:" -ForegroundColor Cyan
Write-Host "  pnpm --version" -ForegroundColor White
Write-Host "  pnpm run lint" -ForegroundColor White
Write-Host ""
