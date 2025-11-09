@echo off
REM Script para compilar Red Salud App Android

echo ========================================
echo Red Salud App - Build Script
echo ========================================
echo.

cd /d C:\Users\Fredd\Dev\red-salud\Android-Apps\Android-App-Paciente

echo [1/3] Limpiando proyecto...
call gradlew clean

echo.
echo [2/3] Sincronizando dependencias...
call gradlew build -x test

echo.
echo [3/3] Compilación completada!
echo.
echo Si no hay errores rojos arriba, la app está lista para Android Studio.
echo.
pause

