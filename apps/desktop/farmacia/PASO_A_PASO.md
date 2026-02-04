# 🚀 GUÍA PASO A PASO: PRIMERA EJECUCIÓN
**Tiempo estimado: 3-4 horas**

---

## ✅ CHECKLIST COMPLETO

### FASE 1: BASE DE DATOS (30 MIN)

#### Paso 1.1: Ir a Supabase
- [ ] Abre: https://app.supabase.com
- [ ] Login con tu cuenta
- [ ] Selecciona proyecto `red-salud`
- [ ] En el menú izquierdo, click en **SQL Editor**
- [ ] Nuevo query (botón azul "+" o "New Query")

#### Paso 1.2: Copiar migración
- [ ] Abre el archivo: `supabase/migrations/20250210000000_create_pharmacy_tables.sql`
- [ ] Selecciona TODO el contenido (Ctrl+A)
- [ ] Copia (Ctrl+C)
- [ ] Pega en el SQL Editor de Supabase (Ctrl+V)
- [ ] Revisa que TODO el código está pegado (debe haber ~400 líneas)

#### Paso 1.3: Ejecutar SQL
- [ ] Click el botón **"Run"** (play verde) o Ctrl+Enter
- [ ] Espera 5-10 segundos
- [ ] **Verifica en la salida**: Debe decir "✓ Tablas creadas..." sin errores rojos
- [ ] Si hay error, revisa la línea indicada

#### Paso 1.4: Verificar tablas
Copia y ejecuta esta query para verificar:
```sql
SELECT 
  COUNT(*) FILTER (WHERE table_name = 'pharmacy_users') as pharmacy_users,
  COUNT(*) FILTER (WHERE table_name = 'products') as products,
  COUNT(*) FILTER (WHERE table_name = 'batches') as batches,
  COUNT(*) FILTER (WHERE table_name = 'invoices') as invoices,
  COUNT(*) FILTER (WHERE table_name = 'suppliers') as suppliers
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Resultado esperado:** Todos deben ser 1 ✅

---

### FASE 2: AUTENTICACIÓN (2-3 HORAS)

#### Paso 2.1: Crear usuario en Supabase Auth
- [ ] En Supabase, ve a **Authentication > Users** (menú izquierdo)
- [ ] Click **"Add User"** (botón azul)
- [ ] Llena:
  - **Email**: admin@farmacia.local
  - **Password**: Elige una contraseña segura (ej: "Farmacia123!@#")
  - Check: "Auto confirm user"
- [ ] Click **"Create User"**
- [ ] Copia el **User ID** (UUID como: 12345678-1234-...)

#### Paso 2.2: Crear usuario en pharmacy_users
- [ ] Vuelve a SQL Editor
- [ ] Ejecuta esta query reemplazando USER_ID_AQUI con el UUID copiado:
```sql
INSERT INTO pharmacy_users (
  id, pharmacy_id, full_name, email, phone, role, is_active
) VALUES (
  'USER_ID_AQUI',
  (SELECT id FROM pharmacy_details LIMIT 1),
  'Admin Farmacia',
  'admin@farmacia.local',
  '+58-2123456789',
  'gerente',
  true
);
```
- [ ] Click Run
- [ ] Debe decir "1 row inserted" ✅

#### Paso 2.3: Obtener API keys de Supabase
- [ ] Ve a **Project Settings > API** (menú izquierdo)
- [ ] Copia:
  - **Project URL** (ej: https://hwckkfiirldgundbcjsp.supabase.co)
  - **Anon/Public key** (llave larga)
- [ ] Guarda estos valores

#### Paso 2.4: Verificar .env.local
En VS Code, abre el archivo: `apps/desktop/farmacia/.env.local`

Verifica que tiene:
```
VITE_SUPABASE_URL=https://hwckkfiirldgundbcjsp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (la llave larga)
```

Si no está, créalo con esos valores.

#### Paso 2.5: Copiar código de auth
- [ ] Abre: [GUIA_RAPIDA_IMPLEMENTACION.md](GUIA_RAPIDA_IMPLEMENTACION.md#2-crear-servicios-y-hooks)
- [ ] En VS Code, abre: `apps/desktop/farmacia/src/services/auth.service.ts`
- [ ] Borra TODO el contenido
- [ ] Copia el código de **auth.service.ts** de la guía
- [ ] Pega y **Guarda (Ctrl+S)**

#### Paso 2.6: Crear otros archivos
Repite el proceso para:
- [ ] `src/store/authStore.ts` (reemplazar TODO)
- [ ] `src/hooks/useAuth.ts` (CREAR archivo nuevo)
- [ ] `src/components/auth/PrivateRoute.tsx` (CREAR archivo nuevo - crea carpeta auth si no existe)
- [ ] `src/pages/LoginPage.tsx` (reemplazar TODO)
- [ ] `src/App.tsx` (reemplazar TODO)

**Cada archivo:**
1. Abre [GUIA_RAPIDA_IMPLEMENTACION.md](GUIA_RAPIDA_IMPLEMENTACION.md)
2. Encuentra el código correspondiente
3. Cópialo
4. Abre el archivo en VS Code
5. Reemplaza o crea
6. Guarda

#### Paso 2.7: Instalar dependencias (si es necesario)
En terminal en la carpeta `apps/desktop/farmacia`:
```bash
npm install
```

(Normalmente ya deberían estar, pero por si acaso)

#### Paso 2.8: Probar Login
- [ ] En terminal: `npm run dev` (en la carpeta farmacia)
- [ ] Abre navegador: http://localhost:5173/login
- [ ] Ingresa:
  - Email: admin@farmacia.local
  - Password: (la contraseña que creaste)
- [ ] Click **"Sign In"**
- [ ] Debe redirigir a `/dashboard` ✅
- [ ] Debe mostrar el nombre "Admin Farmacia"

**Si no funciona:**
- Verifica que user existe en Supabase Auth
- Verifica que user existe en pharmacy_users
- Verifica .env.local con las claves correctas
- Abre la consola (F12) para ver errores

#### Paso 2.9: Test de persistencia
- [ ] Recarga la página (F5)
- [ ] Debe seguir mostrando que estás logueado
- [ ] Debe mantener el usuario en la barra superior
- [ ] Click en logout
- [ ] Debe redirigir a /login ✅

---

### FASE 3: POS BÁSICO (1-2 HORAS)

#### Paso 3.1: Crear componentes del POS
Repite el proceso anterior para cada archivo:

De [GUIA_RAPIDA_IMPLEMENTACION.md](GUIA_RAPIDA_IMPLEMENTACION.md#4-crear-componentes-del-pos):

- [ ] `src/components/pos/ProductSearch.tsx` (crear)
- [ ] `src/components/pos/CartItem.tsx` (crear)
- [ ] `src/components/pos/Cart.tsx` (crear)
- [ ] `src/components/pos/PaymentModal.tsx` (crear)

#### Paso 3.2: Actualizar servicios
De [GUIA_RAPIDA_IMPLEMENTACION.md](GUIA_RAPIDA_IMPLEMENTACION.md#3-crear-servicios-de-productos-e-invoices):

- [ ] `src/services/products.service.ts` (reemplazar TODO)
- [ ] `src/services/invoices.service.ts` (reemplazar TODO)

#### Paso 3.3: Crear hooks
De [GUIA_RAPIDA_IMPLEMENTACION.md](GUIA_RAPIDA_IMPLEMENTACION.md#3-crear-servicios-de-productos-e-invoices):

- [ ] `src/hooks/useProducts.ts` (crear)
- [ ] `src/hooks/useInvoices.ts` (crear)

#### Paso 3.4: Actualizar cartStore
De [GUIA_RAPIDA_IMPLEMENTACION.md](GUIA_RAPIDA_IMPLEMENTACION.md#5-actualizar-carrito):

- [ ] `src/store/cartStore.ts` (reemplazar TODO)

#### Paso 3.5: Actualizar POSPage
Abre `src/pages/POSPage.tsx` y actualiza para usar los componentes:

```typescript
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { ProductSearch } from '@/components/pos/ProductSearch';
import { Cart } from '@/components/pos/Cart';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { useInvoices } from '@/hooks/useInvoices';

export const POSPage = () => {
  const { products, loading, searchProducts } = useProducts();
  const { items, addItem, removeItem, updateQuantity, updateDiscount, clear, getTotal } = useCartStore();
  const { createInvoice } = useInvoices();
  const [showPayment, setShowPayment] = useState(false);

  const totalUsd = getTotal();
  const exchangeRate = 50; // TODO: obtener tasa real

  const handleAddProduct = (product: any) => {
    addItem(product, 1);
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handlePaymentConfirm = async (method: string, paidAmount: number) => {
    await createInvoice({
      items,
      paymentMethod: method,
      paidAmount,
      exchangeRate,
    });
    clear();
    setShowPayment(false);
  };

  return (
    <div className="flex gap-4 p-6">
      {/* Búsqueda */}
      <ProductSearch 
        products={products} 
        loading={loading}
        onSearch={searchProducts}
        onSelectProduct={handleAddProduct}
      />

      {/* Carrito */}
      <Cart
        items={items}
        exchangeRate={exchangeRate}
        onItemQuantityChange={updateQuantity}
        onItemDiscountChange={updateDiscount}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />

      {/* Modal de pago */}
      {showPayment && (
        <PaymentModal
          totalUsd={totalUsd + totalUsd * 0.16} // + IVA
          totalVes={(totalUsd + totalUsd * 0.16) * exchangeRate}
          exchangeRate={exchangeRate}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};
```

- [ ] Copia y pega esto en POSPage
- [ ] Guarda

#### Paso 3.6: Probar POS
- [ ] Asegúrate que `npm run dev` sigue corriendo
- [ ] Recarga navegador (F5)
- [ ] Navega a la sección **POS**
- [ ] Intenta buscar un producto (ej: "Amoxicilina")
- [ ] Debe aparecer en el dropdown ✅
- [ ] Click en el producto
- [ ] Debe aparecer en el carrito ✅
- [ ] Cambia cantidad (números arriba/abajo)
- [ ] Debe actualizar total ✅
- [ ] Click "Procesar Pago"
- [ ] Debe abrir modal de pago ✅
- [ ] Selecciona método (efectivo, tarjeta, etc)
- [ ] Si efectivo, ingresa monto > total
- [ ] Click confirmar
- [ ] Debe crear factura (verifica en Supabase: tabla invoices) ✅

---

## 🎯 VALIDACIÓN FINAL

### Checklist de Éxito

**Base de Datos:**
- [ ] Tabla `pharmacy_users` existe
- [ ] Tabla `products` tiene 5 registros
- [ ] Tabla `batches` tiene 5 registros
- [ ] Tabla `suppliers` tiene 3 registros

**Autenticación:**
- [ ] Login funciona
- [ ] Usuario logueado persiste después de refresh
- [ ] Logout funciona
- [ ] No logueado → redirige a /login

**POS:**
- [ ] Búsqueda de productos funciona
- [ ] Agregar a carrito funciona
- [ ] Total se calcula correctamente
- [ ] Pago crea factura
- [ ] Stock disminuye después de venta

---

## 🐛 TROUBLESHOOTING

### "Cannot read property 'pharmacy_id' of undefined"
**Causa:** pharmacy_users no existe o user no está en la tabla  
**Solución:**
```sql
SELECT * FROM pharmacy_users WHERE email = 'admin@farmacia.local';
```
Si retorna 0 filas, crea el usuario manualmente (ver Paso 2.2)

### "Unknown table 'products'"
**Causa:** SQL migration no ejecutó correctamente  
**Solución:**
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name = 'products' AND table_schema = 'public';
```
Debe retornar 1. Si retorna 0, re-ejecuta la migración.

### "Cannot find module '@/hooks/useAuth'"
**Causa:** Archivo no existe o alias no configurado  
**Solución:**
1. Verifica que creaste `src/hooks/useAuth.ts`
2. Verifica tsconfig.json tiene: `"@/*": ["./src/*"]`

### "Products no aparecen en dropdown"
**Causa:** No hay datos o query fallando  
**Solución:**
```sql
SELECT * FROM products WHERE is_active = true LIMIT 5;
```
Si retorna 0, los datos no fueron insertados. Verifica Paso 1.4

### Página en blanco después de login
**Causa:** DashboardPage no renderiza  
**Solución:**
1. Abre consola (F12)
2. Verifica errores rojos
3. Revisa que Layout existe
4. Revisa que all routes están en App.tsx

---

## 📊 TIEMPO POR FASE

| Fase | Tarea | Tiempo |
|------|-------|--------|
| 1.1-1.2 | Copiar SQL | 5 min |
| 1.3-1.4 | Ejecutar y verificar | 10 min |
| 2.1-2.2 | Crear usuarios | 15 min |
| 2.3-2.4 | Keys y .env | 10 min |
| 2.5-2.9 | Código auth + test | 90 min |
| 3.1-3.6 | Código POS + test | 60 min |
| **TOTAL** | | **190 min (~3h)** |

---

## 🎁 RESULTADO FINAL

Después de seguir todos los pasos:

✅ **Base de datos funcional** con 11 tablas, triggers, RLS  
✅ **Login funcional** con persistencia  
✅ **POS básico** que vende productos  
✅ **Stock se actualiza automáticamente**  
✅ **Facturas se generan**  

**Siguiente:** Pasar a FASE 4 (Inventario) o FASE 5 (Recetas)

---

## 💬 PREGUNTAS FRECUENTES

**P: ¿Puedo saltarme pasos?**  
R: No. Son secuenciales. Cada uno depende del anterior.

**P: ¿Necesito internet?**  
R: Sí. Para Supabase. localhost funciona sin internet una vez descargado.

**P: ¿Qué pasa si me equivoco?**  
R: Puedes borrar las tablas y re-ejecutar el SQL. No pasa nada malo.

**P: ¿Debo hacer esto en production?**  
R: No, esto es desarrollo. Production es después de testing.

**P: ¿Cuánto cuesta esto?**  
R: Supabase free tier soporta esto. Sin costo por ahora.

---

**¿Listo? ¡Comienza con Paso 1.1!** 🚀
