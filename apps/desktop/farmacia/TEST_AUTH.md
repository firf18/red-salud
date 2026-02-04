# 🧪 Guía de Testing - Autenticación

## 📋 Pre-requisitos

1. **Crear usuario de prueba en Supabase**

Ve a Supabase Dashboard → Authentication → Users → Add User

```
Email: test@farmacia.com
Password: Test123456!
```

2. **Agregar usuario a tabla pharmacy_users**

Ve a Supabase Dashboard → Table Editor → pharmacy_users → Insert Row

```sql
INSERT INTO pharmacy_users (id, email, first_name, last_name, role, is_active)
VALUES (
  '[USER_ID_FROM_AUTH]',  -- Copiar el ID del usuario creado en Auth
  'test@farmacia.com',
  'Usuario',
  'Prueba',
  'admin',
  true
);
```

O usa SQL Editor:
```sql
-- Primero obtén el ID del usuario
SELECT id FROM auth.users WHERE email = 'test@farmacia.com';

-- Luego inserta en pharmacy_users
INSERT INTO pharmacy_users (id, email, first_name, last_name, role, is_active)
SELECT 
  id,
  'test@farmacia.com',
  'Usuario',
  'Prueba',
  'admin',
  true
FROM auth.users 
WHERE email = 'test@farmacia.com';
```

---

## 🚀 Iniciar la Aplicación

```bash
cd apps/desktop/farmacia
pnpm tauri:dev
```

---

## ✅ Tests a Realizar

### Test 1: Login Exitoso

**Pasos**:
1. Abrir la app
2. Debe mostrar la página de login
3. Ingresar:
   - Email: `test@farmacia.com`
   - Password: `Test123456!`
4. Click en "Iniciar Sesión"

**Resultado esperado**:
- ✅ Debe mostrar spinner "Iniciando sesión..."
- ✅ Debe redirigir al dashboard
- ✅ Debe mostrar el nombre del usuario en el sidebar
- ✅ Debe guardar la sesión en localStorage

**Verificar en DevTools**:
```javascript
// Abrir DevTools (F12) → Console
localStorage.getItem('farmacia-auth')
// Debe mostrar el objeto con user, pharmacyUser y token
```

---

### Test 2: Login con Credenciales Incorrectas

**Pasos**:
1. Ir a `/login`
2. Ingresar:
   - Email: `wrong@email.com`
   - Password: `wrongpassword`
3. Click en "Iniciar Sesión"

**Resultado esperado**:
- ✅ Debe mostrar error en rojo
- ✅ Mensaje: "Invalid login credentials" o similar
- ✅ NO debe redirigir
- ✅ Campos deben permanecer habilitados

---

### Test 3: Login sin Datos

**Pasos**:
1. Ir a `/login`
2. Dejar campos vacíos
3. Click en "Iniciar Sesión"

**Resultado esperado**:
- ✅ Debe mostrar error: "Por favor ingresa tu email y contraseña"
- ✅ NO debe hacer request a Supabase

---

### Test 4: Rutas Protegidas sin Login

**Pasos**:
1. Asegurarse de NO estar logueado (hacer logout si es necesario)
2. Intentar acceder directamente a:
   - `http://localhost:1420/`
   - `http://localhost:1420/caja`
   - `http://localhost:1420/inventario`

**Resultado esperado**:
- ✅ Todas deben redirigir a `/login`
- ✅ NO debe mostrar contenido protegido

---

### Test 5: Persistencia de Sesión

**Pasos**:
1. Hacer login exitoso
2. Cerrar completamente la aplicación (no solo la ventana)
3. Abrir la aplicación nuevamente

**Resultado esperado**:
- ✅ Debe ir directamente al dashboard
- ✅ NO debe pedir login nuevamente
- ✅ Debe mostrar el nombre del usuario

---

### Test 6: Logout

**Pasos**:
1. Estar logueado
2. Ir al dashboard
3. Click en el botón de logout (en el sidebar)

**Resultado esperado**:
- ✅ Debe redirigir a `/login`
- ✅ Debe limpiar localStorage
- ✅ Intentar volver a `/` debe redirigir a `/login`

**Verificar en DevTools**:
```javascript
localStorage.getItem('farmacia-auth')
// Debe retornar null o un objeto vacío
```

---

### Test 7: Validación de Roles

**Pasos**:
1. Hacer login con usuario que NO sea admin
2. Intentar acceder a `/config`

**Resultado esperado**:
- ✅ Debe mostrar página "Acceso Denegado"
- ✅ Mensaje: "No tienes permisos para acceder a esta página"
- ✅ Botón "Volver" debe funcionar

**Para probar**: Cambiar el rol del usuario en Supabase a `cashier` o `pharmacist`

---

### Test 8: Refresh Token

**Pasos**:
1. Hacer login
2. Esperar 1 hora (o modificar el token expiry en Supabase)
3. Hacer una acción que requiera autenticación

**Resultado esperado**:
- ✅ Debe refrescar el token automáticamente
- ✅ NO debe pedir login nuevamente
- ✅ La acción debe completarse exitosamente

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Causa**: Archivo `.env` no existe o no tiene las variables

**Solución**:
```bash
# Verificar que existe
ls -la apps/desktop/farmacia/.env

# Verificar contenido
cat apps/desktop/farmacia/.env

# Debe contener:
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_ANON_KEY=eyJ...
```

---

### Error: "Usuario no autorizado para acceder a la farmacia"

**Causa**: Usuario existe en `auth.users` pero NO en `pharmacy_users`

**Solución**: Ejecutar el INSERT de la sección Pre-requisitos

---

### Error: "new row violates row-level security policy"

**Causa**: RLS está habilitado y no hay políticas configuradas

**Solución temporal**:
```sql
ALTER TABLE pharmacy_users DISABLE ROW LEVEL SECURITY;
```

**Solución permanente**: Configurar políticas RLS correctamente

---

### La app no inicia

**Causa**: Dependencias no instaladas o error de compilación

**Solución**:
```bash
cd apps/desktop/farmacia
pnpm install
pnpm tauri:dev
```

---

### Login funciona pero no redirige

**Causa**: Posible error en el navigate

**Solución**: Verificar en DevTools → Console si hay errores

---

## 📊 Checklist de Verificación

- [ ] Login exitoso funciona
- [ ] Login con credenciales incorrectas muestra error
- [ ] Login sin datos muestra error
- [ ] Rutas protegidas redirigen a login
- [ ] Persistencia de sesión funciona
- [ ] Logout funciona correctamente
- [ ] Validación de roles funciona
- [ ] No hay errores en consola
- [ ] localStorage guarda correctamente
- [ ] UI se ve bien y es responsiva

---

## 🎉 Si todos los tests pasan

**¡Felicidades! La autenticación está completamente funcional** 🚀

Puedes continuar con el Día 2: Dashboard y Productos

---

## 📝 Notas

- Los tests deben hacerse en orden
- Limpiar localStorage entre tests si es necesario
- Verificar la consola de DevTools en cada test
- Tomar screenshots de errores para debugging

---

**Última actualización**: [Hoy]
