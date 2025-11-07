# ✅ Sistema de Verificación SACS - Listo para Probar

## 🎯 Estado Actual

✅ **Base de Datos**: Tabla `verificaciones_sacs` creada  
✅ **Edge Function**: Configurada y lista  
✅ **Dashboard**: Integrado en `/dashboard/medico/perfil/setup`  
⏳ **Backend Service**: Pendiente de desplegar

---

## 🚀 Cómo Probar (Modo Desarrollo)

### Opción 1: Con Backend Local

1. **Iniciar el servicio backend**:
   ```bash
   cd sacs-verification-service
   npm install
   npm start
   ```
   
   El servicio estará en: `http://localhost:3001`

2. **Configurar la Edge Function** (temporal para desarrollo):
   - La Edge Function ya está configurada para usar `http://localhost:3001` por defecto
   - Si necesitas cambiar la URL, edita `supabase/functions/verify-doctor-sacs/index.ts`

3. **Iniciar Next.js**:
   ```bash
   npm run dev
   ```

4. **Probar en el navegador**:
   - Ve a: `http://localhost:3000/dashboard/medico/perfil/setup`
   - Inicia sesión como médico
   - Prueba con las cédulas de ejemplo

### Opción 2: Solo Frontend (Mock)

Si no quieres iniciar el backend, puedes modificar temporalmente la Edge Function para retornar datos de prueba.

---

## 🧪 Cédulas de Prueba

### ✅ Cédula Válida (Médico Cirujano)
```
Tipo: V
Cédula: 15229045
Resultado Esperado: ✅ APTO
Nombre: KARIM MOUKHALLALELE
Profesión: MÉDICO(A) CIRUJANO(A)
Matrícula: MPPS-68475
Postgrados: 2 (Infectología Pediátrica, Pediatría)
```

### ✅ Otra Cédula Válida
```
Tipo: V
Cédula: 17497542
Resultado Esperado: ✅ APTO
Nombre: MARLIN GRISSELL SANCHEZ RINCON
Profesión: MÉDICO(A) CIRUJANO(A)
Matrícula: MPPS-77057
Postgrados: 2 (Medicina Interna, Medicina Crítica)
```

### ❌ Médico Veterinario (Rechazado)
```
Tipo: V
Cédula: 7983901
Resultado Esperado: ❌ NO APTO
Razón: Médico Veterinario
Mensaje: "Esta cédula corresponde a un médico veterinario..."
```

### ❌ No Registrado
```
Tipo: V
Cédula: 30218596
Resultado Esperado: ❌ NO ENCONTRADO
Razón: No registrado en SACS
```

---

## 📋 Flujo de Prueba Completo

### 1. Registro de Médico

1. Ve a `/auth/register/medico`
2. Crea una cuenta nueva
3. Serás redirigido a `/dashboard/medico/perfil/setup`

### 2. Verificación SACS

1. **Paso 1: Verificación**
   - Selecciona tipo de documento: `V`
   - Ingresa cédula: `15229045`
   - Clic en "Verificar Identidad"
   - Espera ~10-15 segundos (el SACS es lento)

2. **Resultado Esperado**:
   ```
   ✅ Verificación Exitosa con SACS
   
   Nombre Completo: KARIM MOUKHALLALELE
   Documento: V-15229045
   Profesión Principal: MÉDICO(A) CIRUJANO(A)
   Matrícula: MPPS-68475
   Especialidad Sugerida: INFECTOLOGÍA PEDIÁTRICA
   
   Postgrados Registrados:
   • INFECTOLOGÍA PEDIÁTRICA (2013-06-17)
   • PEDIATRÍA Y PUERICULTURA (2010-12-17)
   ```

3. **Paso 2: Completar Perfil**
   - Selecciona especialidad en Red-Salud
   - Agrega teléfono profesional (opcional)
   - Agrega email profesional (opcional)
   - Escribe biografía (opcional)
   - Clic en "Completar Registro"

4. **Resultado**:
   - Serás redirigido a `/dashboard/medico`
   - Tu perfil estará verificado ✅

### 3. Verificar en Base de Datos

```sql
-- Ver la verificación guardada
SELECT * FROM verificaciones_sacs 
WHERE cedula = '15229045';

-- Ver el perfil actualizado
SELECT 
  nombre_completo,
  cedula,
  cedula_verificada,
  sacs_verificado,
  sacs_nombre,
  sacs_matricula,
  sacs_especialidad,
  sacs_fecha_verificacion
FROM profiles 
WHERE cedula = '15229045';
```

---

## 🐛 Casos de Error a Probar

### 1. Médico Veterinario
```
Cédula: 7983901
Mensaje Esperado: "Esta cédula corresponde a un médico veterinario. 
Red-Salud es exclusivamente para profesionales de salud humana."
```

### 2. Cédula No Registrada
```
Cédula: 30218596
Mensaje Esperado: "Esta cédula no está registrada en el SACS 
como profesional de la salud"
```

### 3. Formato Inválido
```
Cédula: "abc123"
Mensaje Esperado: "Solo números, sin puntos ni guiones"
```

### 4. Cédula Muy Corta
```
Cédula: "123"
Mensaje Esperado: "Cédula debe tener entre 6 y 10 dígitos"
```

### 5. Sin Tipo de Documento
```
Mensaje Esperado: "Selecciona el tipo de documento"
```

---

## 📊 Verificar Logs

### Logs del Backend
```bash
# En la terminal donde corre el backend
# Verás:
[SACS] Iniciando verificación: V-15229045
[SACS] Navegando a la página...
[SACS] Tabla de datos básicos cargada
[SACS] Tabla de profesiones cargada
[SACS] Extrayendo postgrados...
[SACS] 2 postgrado(s) encontrado(s)
[SACS] Verificación completada: APROBADO
```

### Logs de la Edge Function
```bash
supabase functions logs verify-doctor-sacs --follow
```

### Logs del Frontend
```
Abre la consola del navegador (F12)
Verás:
Verificando: {cedula: "15229045", tipo_documento: "V"}
Respuesta: {success: true, verified: true, data: {...}}
Perfil completado exitosamente
```

---

## 🎨 UI/UX Esperada

### Paso 1: Verificación
- ✅ Formulario limpio con 2 campos
- ✅ Botón con loading spinner
- ✅ Mensajes de error claros
- ✅ Info sobre el SACS

### Paso 2: Datos Verificados
- ✅ Card verde con check de verificación
- ✅ Datos del SACS en formato legible
- ✅ Postgrados destacados en azul
- ✅ Nombre no editable (viene del SACS)

### Paso 3: Completar Perfil
- ✅ Formulario con especialidad requerida
- ✅ Campos opcionales claramente marcados
- ✅ Botón "Volver" por si se equivocó
- ✅ Redirección automática al dashboard

---

## 🔧 Troubleshooting

### Error: "Cannot connect to backend"
**Solución**: Verifica que el servicio backend esté corriendo en `http://localhost:3001`
```bash
curl http://localhost:3001/health
```

### Error: "Navigation timeout"
**Causa**: El sitio SACS está caído o muy lento  
**Solución**: Espera unos minutos y reintenta

### Error: "No se encontraron datos"
**Causa**: La cédula no existe en el SACS  
**Solución**: Verifica el número de cédula

### La página se queda en "Verificando..."
**Causa**: El backend no responde  
**Solución**: 
1. Verifica logs del backend
2. Verifica que Puppeteer esté instalado
3. Reinicia el servicio backend

---

## 📝 Checklist de Prueba

- [ ] Backend corriendo en localhost:3001
- [ ] Health check del backend funciona
- [ ] Next.js corriendo en localhost:3000
- [ ] Registro de nuevo médico
- [ ] Verificación con cédula válida (15229045)
- [ ] Ver datos verificados correctamente
- [ ] Completar perfil
- [ ] Redirección al dashboard
- [ ] Verificar datos en BD
- [ ] Probar con veterinario (7983901)
- [ ] Probar con cédula no registrada (30218596)
- [ ] Probar validaciones de formulario
- [ ] Ver logs en consola
- [ ] Ver logs del backend

---

## 🚀 Próximo Paso: Desplegar a Producción

Una vez que todo funcione localmente:

1. **Desplegar backend** en Railway/Render
2. **Configurar variable** `SACS_BACKEND_URL` en Supabase
3. **Desplegar Edge Function**
4. **Probar en producción** con las mismas cédulas

Ver: `docs/DEPLOY-VERIFICACION-SACS-PRODUCCION.md`

---

**Última actualización**: 7 de noviembre de 2025  
**Estado**: ✅ Listo para probar en desarrollo
