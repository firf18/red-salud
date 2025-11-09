# 🚀 INSTRUCCIONES RÁPIDAS - Red Salud App Android

## ⚡ En 5 Minutos

### 1️⃣ Descargar y Abrir
```bash
cd Android-Apps/Android-App-Paciente
# Abrir en Android Studio
```

### 2️⃣ Sincronizar
- Esperar a que Gradle sincronice automáticamente
- Si hay error: Build > Clean Project > Rebuild Project

### 3️⃣ Ejecutar
- Conectar dispositivo o iniciar emulador
- Presionar: Shift + F10 (Windows) o Ctrl + R (Mac)
- O: Run > Run 'app'

### 4️⃣ Registrarse
```
Email: ejemplo@correo.com
Contraseña: 123456
Nombre: Tu Nombre
Cédula: 12345678
```

### 5️⃣ ¡Listo!
- Explora todas las secciones
- Prueba todas las funcionalidades
- ¡Disfruta! 🎉

---

## 📱 Requisitos Mínimos

- Android Studio (Hedgehog 2023.1+)
- JDK 11+
- Android SDK 31+ (descarga automática)
- Conexión a Internet

---

## 🎯 Funcionalidades Principales

### Login/Registro
```
✅ Crear cuenta con email y contraseña
✅ Validación de cédula
✅ Iniciar sesión
```

### Dashboard
```
✅ Ver estadísticas
✅ Citas próximas
✅ Medicamentos activos
✅ Últimas métricas
```

### Secciones
```
✅ Citas - Agendar, cancelar, ver detalles
✅ Medicinas - Ver dosis e indicaciones
✅ Laboratorio - Resultados de exámenes
✅ Métricas - Registrar y ver historial
✅ Historial - Registros médicos
✅ Mensajes - Chat con médicos
✅ Telemedicina - Videoconsultas
```

---

## 🔧 Troubleshooting

### Error de compilación
```bash
./gradlew clean build
```

### No sincroniza Gradle
```
File > Project Structure > SDK Location
Seleccionar ruta de Android SDK
```

### App no inicia
```
View > Tool Windows > Logcat
Ver errores y resolver según el mensaje
```

### Dispositivo no conecta
```
adb devices
adb reverse tcp:5000 tcp:5000
```

---

## 📁 Archivos Importantes

```
app/
├── build.gradle.kts          ← Dependencias
├── src/main/AndroidManifest.xml  ← Permisos
└── src/main/java/
    └── com/example/red_salud_paciente/
        ├── MainActivity.kt    ← Punto de entrada
        ├── data/             ← Modelos y API
        ├── presentation/     ← Pantallas UI
        └── di/               ← Inyección
```

---

## 💡 Consejos

1. **Primera vez**: Espera 5 minutos en la compilación inicial
2. **Cambios de código**: Presiona Ctrl+F5 para recargar
3. **Logcat**: Siempre revisa los errores en rojo
4. **Hot Reload**: Functiona mejor con cambios en UI
5. **Limpiar datos**: Settings > Apps > Red Salud > Clear Cache

---

## 🔗 Enlaces Útiles

- [Android Studio Download](https://developer.android.com/studio)
- [Jetpack Compose Docs](https://developer.android.com/develop/ui/compose)
- [Supabase Documentation](https://supabase.com/docs)

---

## 📞 Soporte

¿Problemas?
1. Revisar documentación completa en carpeta
2. Revisar Logcat en Android Studio
3. Contactar al equipo de desarrollo

---

## ✅ Checklist de Instalación

- [ ] Android Studio instalado
- [ ] JDK 11+ disponible
- [ ] Proyecto abierto en Android Studio
- [ ] Gradle sincronizado
- [ ] Dispositivo/Emulador listo
- [ ] App compilada sin errores
- [ ] App ejecutándose
- [ ] Registro completado
- [ ] Login exitoso
- [ ] Dashboard visible

---

## 🎉 ¡Ya Estás Listo!

La app Android de Red Salud está lista para usar.

**Próximos pasos:**
- Explorar todas las pantallas
- Registrarse y probar todas las funciones
- Reportar bugs si encuentras alguno
- ¡Disfrutar! 🚀

---

**¡Que disfrutes usando Red Salud! ❤️**

