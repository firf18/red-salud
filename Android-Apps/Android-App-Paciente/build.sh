#!/bin/bash
# Script para verificar y compilar Red Salud Android App

echo "════════════════════════════════════════════════════════════"
echo "🚀 RED SALUD - VERIFICACIÓN Y COMPILACIÓN"
echo "════════════════════════════════════════════════════════════"
echo ""

# Cambiar al directorio del proyecto
cd "$(dirname "$0")" || exit

echo "📋 Estado de Archivos:"
echo "─────────────────────────────────────────────────────────────"

# Verificar archivos principales
files=(
    "app/build.gradle.kts"
    "app/src/main/java/com/example/red_salud_paciente/presentation/screens/AuthScreens.kt"
    "app/src/main/java/com/example/red_salud_paciente/presentation/screens/GoogleSignInComponents.kt"
    "app/src/main/java/com/example/red_salud_paciente/utils/GoogleSignInUtils.kt"
    "app/src/main/java/com/example/red_salud_paciente/presentation/viewmodels/ViewModels.kt"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (NOT FOUND)"
    fi
done

echo ""
echo "🔧 Limpieza de build anteriores..."
echo "─────────────────────────────────────────────────────────────"
./gradlew.bat clean

echo ""
echo "🏗️  Compilando proyecto..."
echo "─────────────────────────────────────────────────────────────"
./gradlew.bat build

echo ""
echo "✅ COMPILACIÓN COMPLETADA"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📝 PRÓXIMOS PASOS:"
echo "─────────────────────────────────────────────────────────────"
echo "1. Obtener credenciales de Google Cloud Console"
echo "2. Descargar google-services.json"
echo "3. Colocar en: app/google-services.json"
echo "4. Ejecutar: ./gradlew build nuevamente"
echo ""
echo "📖 Ver: GUIA_GOOGLE_SIGNIN_COMPLETA.md para instrucciones detalladas"
echo "════════════════════════════════════════════════════════════"

