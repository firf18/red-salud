# 📁 Estructura de Archivos - App Tauri Farmacia

## 🎯 Archivos que NECESITAMOS crear

### 📝 Configuración

```
apps/desktop/farmacia/
├── .env                          ❌ CREAR
├── .env.example                  ❌ CREAR
```

### 🔧 Hooks Personalizados

```
src/hooks/
├── useSupabase.ts               ❌ CREAR - Hooks generales de Supabase
├── useProducts.ts               ❌ CREAR - Gestión de productos
├── useInvoices.ts               ❌ CREAR - Gestión de facturas
├── useBatches.ts                ❌ CREAR - Gestión de lotes
├── useAlerts.ts                 ❌ CREAR - Sistema de alertas
├── useInventoryAlerts.ts        ❌ CREAR - Alertas de inventario
├── useAuth.ts                   ❌ CREAR - Autenticación
├── useSync.ts                   ❌ CREAR - Sincronización
```

### 🧩 Componentes

```
src/components/
├── common/
│   ├── ErrorBoundary.tsx        ❌ CREAR
│   ├── LoadingSpinner.tsx       ❌ CREAR
│   ├── LoadingSkeleton.tsx      ❌ CREAR
│   ├── Toast.tsx                ❌ CREAR
│   └── ConfirmDialog.tsx        ❌ CREAR
│
├── products/
│   ├── ProductForm.tsx          ❌ CREAR
│   ├── ProductModal.tsx         ❌ CREAR
│   ├── ProductCard.tsx          ❌ CREAR
│   ├── ProductSearch.tsx        ❌ CREAR
│   └── BatchManager.tsx         ❌ CREAR
│
├── pos/
│   ├── CartItem.tsx             ❌ CREAR
│   ├── PaymentModal.tsx         ❌ CREAR
│   ├── InvoicePreview.tsx       ❌ CREAR
│   └── HeldCartsModal.tsx       ❌ CREAR
│
├── reports/
│   ├── SalesChart.tsx           ❌ CREAR
│   ├── InventoryChart.tsx       ❌ CREAR
│   └── ReportFilters.tsx        ❌ CREAR
│
└── auth/
    ├── PrivateRoute.tsx         ❌ CREAR
    └── RoleGuard.tsx            ❌ CREAR
```

### 🗄️ Stores Adicionales

```
src/store/
├── authStore.ts                 ✅ EXISTE - Mejorar
├── cartStore.ts                 ✅ EXISTE - Mejorar
├── inventoryStore.ts            ❌ CREAR
├── alertsStore.ts               ❌ CREAR
└── syncStore.ts                 ❌ CREAR
```

### 🔌 Servicios

```
src/services/
├── supabase/
│   ├── products.service.ts      ❌ CREAR
│   ├── invoices.service.ts      ❌ CREAR
│   ├── batches.service.ts       ❌ CREAR
│   ├── auth.service.ts          ❌ CREAR
│   └── reports.service.ts       ❌ CREAR
│
├── local/
│   ├── sqlite.service.ts        ❌ CREAR
│   └── sync.service.ts          ❌ CREAR
│
└── utils/
    ├── currency.ts              ❌ CREAR
    ├── validation.ts            ❌ CREAR
    ├── formatting.ts            ❌ CREAR
    └── calculations.ts          ❌ CREAR
```

### 📊 Types

```
src/types/
├── product.types.ts             ❌ CREAR
├── invoice.types.ts             ❌ CREAR
├── batch.types.ts               ❌ CREAR
├── user.types.ts                ❌ CREAR
├── alert.types.ts               ❌ CREAR
└── index.ts                     ❌ CREAR
```

### 🦀 Rust/Tauri

```
src-tauri/
├── src/
│   ├── main.rs                  ✅ EXISTE - Mejorar
│   ├── commands/
│   │   ├── mod.rs               ❌ CREAR
│   │   ├── products.rs          ❌ CREAR
│   │   ├── invoices.rs          ❌ CREAR
│   │   └── sync.rs              ❌ CREAR
│   │
│   └── db/
│       ├── mod.rs               ❌ CREAR
│       ├── schema.rs            ❌ CREAR
│       └── migrations.rs        ❌ CREAR
│
└── migrations/
    ├── 001_initial.sql          ❌ CREAR
    ├── 002_products.sql         ❌ CREAR
    └── 003_sync.sql             ❌ CREAR
```

### 📄 Páginas a Mejorar

```
src/pages/
├── LoginPage.tsx                ✅ EXISTE - Mejorar
├── DashboardPage.tsx            ✅ EXISTE - Mejorar
├── POSPage.tsx                  ✅ EXISTE - Mejorar
├── InventoryPage.tsx            ✅ EXISTE - Mejorar
├── RecetasPage.tsx              ✅ EXISTE - Mejorar
├── VentasPage.tsx               ✅ EXISTE - Mejorar
├── AlertasPage.tsx              ✅ EXISTE - Mejorar
├── EntregasPage.tsx             ✅ EXISTE - Mejorar
├── ProveedoresPage.tsx          ✅ EXISTE - Mejorar
├── ReportesPage.tsx             ✅ EXISTE - Mejorar
└── ConfigPage.tsx               ✅ EXISTE - Mejorar
```

---

## 📊 Resumen de Archivos

### Por Crear
- **Configuración**: 2 archivos
- **Hooks**: 8 archivos
- **Componentes**: 20 archivos
- **Stores**: 3 archivos nuevos + 2 mejorar
- **Servicios**: 11 archivos
- **Types**: 6 archivos
- **Rust**: 9 archivos
- **Migraciones SQL**: 3 archivos

**Total**: ~62 archivos nuevos + 13 archivos a mejorar

---

## 🎯 Prioridad de Creación

### 🔥 Prioridad 1 (Día 1-2)
1. `.env` y `.env.example`
2. `useAuth.ts`
3. `auth.service.ts`
4. `PrivateRoute.tsx`
5. Mejorar `LoginPage.tsx`
6. Mejorar `authStore.ts`

### 🔥 Prioridad 2 (Día 3-4)
7. `useProducts.ts`
8. `products.service.ts`
9. `ProductSearch.tsx`
10. `CartItem.tsx`
11. Mejorar `POSPage.tsx`
12. Mejorar `cartStore.ts`

### 📊 Prioridad 3 (Día 5-7)
13. `useInvoices.ts`
14. `invoices.service.ts`
15. `PaymentModal.tsx`
16. `InvoicePreview.tsx`
17. `ProductForm.tsx`
18. `ProductModal.tsx`
19. Mejorar `InventoryPage.tsx`

### 📊 Prioridad 4 (Día 8-10)
20. `useBatches.ts`
21. `batches.service.ts`
22. `BatchManager.tsx`
23. `useAlerts.ts`
24. `alertsStore.ts`
25. Mejorar `AlertasPage.tsx`

### 🎨 Prioridad 5 (Día 11-14)
26. Componentes comunes (ErrorBoundary, Loading, etc.)
27. Servicios de utilidades
28. Types completos
29. Rust commands
30. SQLite local

---

## 🚀 Comenzar con lo Esencial

**Archivos mínimos para tener POS funcional**:

1. `.env` - Credenciales
2. `useAuth.ts` - Autenticación
3. `useProducts.ts` - Productos
4. `products.service.ts` - Servicio de productos
5. `invoices.service.ts` - Servicio de facturas
6. Mejorar `POSPage.tsx` - Conectar con Supabase
7. Mejorar `cartStore.ts` - Validaciones

Con estos 7 archivos/mejoras, ya podríamos procesar ventas reales! 🎉
