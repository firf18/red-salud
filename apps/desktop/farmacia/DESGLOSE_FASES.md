# 📊 DESGLOSE DETALLADO POR FASE
**Documento de Referencia Rápida**

---

## FASE 1: BASE DE DATOS (Días 1-2) ✅

### Checklist de Día 1
- [ ] Crear migration en Supabase con todas las tablas
- [ ] Crear índices en 11 tablas principales
- [ ] Implementar RLS (Row Level Security)
- [ ] Crear 4 triggers para automatización
- [ ] Validar que no hay errores en la migración

### Checklist de Día 2
- [ ] Insertar 5 medicamentos de prueba
- [ ] Crear 10 lotes con datos realistas
- [ ] Insertar 3 proveedores de prueba
- [ ] Crear usuario gerente de prueba
- [ ] Ejecutar queries de validación
- [ ] Documentar cualquier issue encontrado

**Archivos a Crear/Modificar**: Ninguno (solo en Supabase)

**Pruebas**: Ejecutar queries en Supabase SQL Editor

---

## FASE 2: AUTENTICACIÓN (Días 3-4) ✅

### Checklist de Día 3

#### Servicios (1.5 horas)
- [ ] Actualizar `src/services/auth.service.ts`
  - `login()` - conectado a BD
  - `logout()`
  - `getCurrentUser()`
  - `resetPassword()`
  - `onAuthStateChange()`

#### Stores (1 hora)
- [ ] Actualizar `src/store/authStore.ts`
  - Usar Zustand + persist
  - Estados: user, pharmacyUser, isAuthenticated, isLoading
  - Métodos: login, logout, refreshUser, checkAuth

#### Hooks (45 min)
- [ ] Crear `src/hooks/useAuth.ts`
  - Verificar auth al montar
  - Escuchar cambios de auth
  - Retornar user, pharmacyUser, métodos

#### Componentes (1 hora)
- [ ] Crear `src/components/auth/PrivateRoute.tsx`
  - Verificar autenticación
  - Verificar roles (opcional)
  - Loading state

#### UI (2 horas)
- [ ] Actualizar `src/pages/LoginPage.tsx`
  - Form con validación Zod
  - Error handling
  - Loading state
  - Redirección correcta

### Checklist de Día 4

#### Integración (1 hora)
- [ ] Actualizar `src/App.tsx`
  - Rutas protegidas con PrivateRoute
  - Redirecciones correctas
  - Loading state global

#### Testing Manual (3 horas)
- [ ] Probar login correctamente
- [ ] Probar login con credenciales incorrectas
- [ ] Probar usuario inactivo
- [ ] Probar logout
- [ ] Probar persistencia (F5 en dashboard)
- [ ] Probar acceso directo a URLs
- [ ] Probar diferentes roles

#### Documentación (2 horas)
- [ ] Documentar flujo de auth
- [ ] Documentar errores encontrados
- [ ] Documentar cualquier cambio

**Archivos a Modificar**:
1. `src/services/auth.service.ts` (98 líneas)
2. `src/store/authStore.ts` (100+ líneas)
3. `src/hooks/useAuth.ts` (CREAR)
4. `src/components/auth/PrivateRoute.tsx` (CREAR)
5. `src/pages/LoginPage.tsx` (150+ líneas)
6. `src/App.tsx` (100+ líneas)

**Testing**: Manual en browser

---

## FASE 3: POS FUNCIONAL (Días 5-8) ✅

### Día 5: Servicios (6 horas)

#### 5.1 ProductsService (2 horas)
- [ ] `getAll()` - todos los productos activos
- [ ] `getById()` - con lotes
- [ ] `search()` - búsqueda completa
- [ ] `getAvailableBatches()` - FEFO
- [ ] `getLowStock()`, `getOutOfStock()`
- [ ] CRUD: create, update, delete

#### 5.2 InvoicesService (2 horas)
- [ ] `createInvoice()` - crear factura + items + actualizar stock
- [ ] `generateInvoiceNumber()` - auto-increment
- [ ] `getByUser()` - historial
- [ ] `getWithItems()` - factura completa

**Notas**:
- Usar transacciones para consistencia
- Descontar stock automáticamente
- Crear movimientos de inventario
- Manejar FEFO correctamente

#### 5.3 Hooks (1.5 horas)
- [ ] `useProducts.ts` - fetchAll, search, getBatches
- [ ] `useInvoices.ts` - createInvoice

**Archivos a Crear/Modificar**:
1. `src/services/products.service.ts` (200+ líneas)
2. `src/services/invoices.service.ts` (200+ líneas)
3. `src/hooks/useProducts.ts` (CREAR)
4. `src/hooks/useInvoices.ts` (CREAR)

---

### Días 6-7: Componentes POS (12 horas)

#### 6.1 ProductSearch (2 horas)
- [ ] Input con búsqueda
- [ ] Debounce 300ms
- [ ] Dropdown con resultados
- [ ] Click para seleccionar

**Archivo**: `src/components/pos/ProductSearch.tsx`

#### 6.2 CartItem (1.5 horas)
- [ ] Mostrar producto en carrito
- [ ] Cantidad
- [ ] Precio unitario
- [ ] Descuento
- [ ] Subtotal
- [ ] Botón eliminar

**Archivo**: `src/components/pos/CartItem.tsx`

#### 6.3 Cart (2 horas)
- [ ] Listar items
- [ ] Totales USD/VES
- [ ] Cálculo de IVA
- [ ] Resumen
- [ ] Botón procesar pago

**Archivo**: `src/components/pos/Cart.tsx`

#### 6.4 PaymentModal (3 horas)
- [ ] Seleccionar método de pago (5 opciones)
- [ ] Ingresar montos
- [ ] Calcular cambio
- [ ] Confirmar pago
- [ ] Manejo de errores

**Archivo**: `src/components/pos/PaymentModal.tsx`

#### 6.5 InvoicePreview (2 horas)
- [ ] Mostrar factura completa
- [ ] Formato para impresión
- [ ] Botón imprimir
- [ ] Botón descargar PDF

**Archivo**: `src/components/pos/InvoicePreview.tsx`

#### 6.6 POSPage integrado (1.5 horas)
- [ ] Integrar todos los componentes
- [ ] Flujo: Search → Add → Cart → Pay → Preview
- [ ] Manejo de errores
- [ ] Loading states

**Archivo**: `src/pages/POSPage.tsx` (actualizar)

---

### Día 8: Testing & Pulido (6 horas)

#### Pruebas Funcionales
- [ ] Buscar producto que existe
- [ ] Buscar producto que no existe
- [ ] Agregar al carrito
- [ ] Aumentar/disminuir cantidad
- [ ] Aplicar descuento
- [ ] Ver totales correctos
- [ ] Seleccionar método de pago
- [ ] Procesar venta
- [ ] Verificar factura
- [ ] Imprimir factura

#### Pruebas de Edge Cases
- [ ] Agregar más cantidad que stock disponible
- [ ] Productos con receta (requiere validación)
- [ ] Stock se actualiza después de venta
- [ ] Número de factura auto-incrementa
- [ ] Cambio se calcula correctamente

#### Optimizaciones
- [ ] Agregar debounce a búsqueda
- [ ] Mejorar performance de componentes
- [ ] Optimizar queries a Supabase
- [ ] Agregar loading states
- [ ] Mejorar UX/validaciones

---

## FASE 4: INVENTARIO (Días 9-10) ✅

### Día 9: Servicios & Hooks (6 horas)

#### Servicios
- [ ] `ProductsService` - ya existe, solo mejorar
- [ ] Crear `src/services/batches.service.ts`
  - `getByProduct()`
  - `create()` - agregar lote
  - `update()` - editar lote
  - `delete()` - eliminar lote
- [ ] Crear `src/services/inventory.service.ts`
  - `getMovements()` - historial
  - `getLowStock()`
  - `getExpiring()` - próximos a vencer

#### Hooks
- [ ] `useBatches.ts` - CRUD de lotes
- [ ] `useInventory.ts` - consultas

### Día 10: UI & Testing (6 horas)

#### Componentes
- [ ] `ProductForm.tsx` - formulario para agregar/editar
- [ ] `BatchManager.tsx` - gestión de lotes
- [ ] `BatchForm.tsx` - agregar/editar lote
- [ ] `InventoryPage.tsx` - página completa

#### Testing
- [ ] CRUD de productos
- [ ] CRUD de lotes
- [ ] Validaciones
- [ ] Stock se actualiza correctamente
- [ ] Alertas se generan

---

## FASE 5: RECETAS (Días 11-13) ✅

### Día 11: Servicios (6 horas)

- [ ] `prescriptions.service.ts`
  - Conectar con tabla `prescriptions`
  - `getPrescriptions()` - listado
  - `getById()` - con medicamentos
  - `dispensePrescription()` - procesar
  - `validatePrescription()` - validaciones

### Día 12: UI (6 horas)

- [ ] `RecetasPage.tsx` - conectar con datos reales
- [ ] Listar recetas
- [ ] Filtros (estado, médico, paciente)
- [ ] Vista detallada
- [ ] Proceso de dispensación

### Día 13: Testing (4 horas)

- [ ] Listar recetas del paciente
- [ ] Validar receta vigente
- [ ] Dispensar receta
- [ ] Actualizar stock
- [ ] Mostrar errores

---

## FASE 6: FEATURES ADICIONALES (Días 14-18) ✅

### Día 14: Reportes (6 horas)

- [ ] `reports.service.ts` - mejorar
- [ ] `ReportesPage.tsx` - conectar datos
- [ ] Gráficos de ventas
- [ ] Top productos
- [ ] Análisis por método de pago
- [ ] Exportar CSV

### Día 15: Alertas (5 horas)

- [ ] `alerts.service.ts` - mejorar
- [ ] `AlertasPage.tsx` - conectar
- [ ] Mostrar alertas en tiempo real
- [ ] Filtros por severidad
- [ ] Marcar como resuelta

### Día 16: Entregas (5 horas)

- [ ] Crear `deliveries.service.ts`
- [ ] `EntregasPage.tsx` - UI
- [ ] Crear orden de entrega
- [ ] Seguimiento
- [ ] Cálculo de costo

### Día 17: Proveedores (5 horas)

- [ ] Crear `suppliers.service.ts`
- [ ] Crear `purchases.service.ts`
- [ ] `ProveedoresPage.tsx` - UI
- [ ] Órdenes de compra
- [ ] Recepción de mercancía

### Día 18: Configuración (4 horas)

- [ ] `settings.service.ts`
- [ ] `ConfigPage.tsx` - UI
- [ ] Configurar farmacia
- [ ] Usuarios y permisos
- [ ] Configuración general

---

## FASE 7: TESTING & DEPLOYMENT (Días 19-22) ✅

### Día 19: Testing Completo (8 horas)

#### Unit Tests
- [ ] Auth service
- [ ] Products service
- [ ] Invoices service
- [ ] Validaciones

#### Integration Tests
- [ ] Flujo completo POS
- [ ] Flujo recetas
- [ ] Flujo inventario

#### End-to-End
- [ ] Todos los features

### Día 20: Bug Fixes & Optimization (6 horas)

- [ ] Arreglar issues encontrados
- [ ] Optimizar queries
- [ ] Mejorar UX
- [ ] Performance

### Día 21: Preparación a Producción (5 horas)

- [ ] Configurar variables de env
- [ ] Configurar RLS correctamente
- [ ] Backups
- [ ] Documentación

### Día 22: Deployment & Monitoreo (5 horas)

- [ ] Deploy a Tauri
- [ ] Probar en desktop
- [ ] Crear instalador
- [ ] Monitoreo
- [ ] Documentación final

---

## 📌 PRIORIDADES CRÍTICAS

**DEBE estar listo ANTES de continuar**:
1. ✅ Base de datos (Fase 1)
2. ✅ Autenticación (Fase 2)
3. ✅ POS básico (Fase 3)
4. ✅ Inventario (Fase 4)
5. ⏳ Recetas (Fase 5)

**PUEDE esperar**:
- Entregas
- Proveedores
- Configuración avanzada

---

## 🚀 TIMELINE REALISTA

```
Semana 1: BD + Auth = 8 días
Semana 2: POS + Inventario = 8 días
Semana 3: Recetas + Extras = 8 días
Semana 4: Testing + Deploy = 8 días

Total: 4 semanas (18-22 días) para MVP 100% funcional
```

---

## 💡 TIPS & TRICKS

### Para Acelerar
1. Usar datos de prueba realistas desde el inicio
2. Testing manual mientras desarrollas
3. Reutilizar componentes
4. Documentar mientras avanzas

### Para Evitar Problemas
1. Siempre usar transacciones en operaciones críticas
2. Crear índices para queries frecuentes
3. Validar en frontend Y backend
4. Backups frecuentes de BD

### Herramientas Útiles
- Supabase Dashboard para testing
- Browser DevTools para debugging
- Git para versionado

---

## 📞 CHECKLIST FINAL

Antes de pasar a la siguiente fase:
- [ ] Todos los tests pasan
- [ ] No hay errores en console
- [ ] Funcionalidad probada manualmente
- [ ] Documentación actualizada
- [ ] Código limpio (sin TODOs)
