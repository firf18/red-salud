# Red Salud - Sistema ERP/POS Farmacéutico

Sistema de gestión farmacéutica completo para cadenas de farmacias en Venezuela, con cumplimiento fiscal SENIAT, soporte multi-moneda, y gestión de inventario FEFO.

## 🚀 Características Principales

- **POS Optimizado**: Interfaz táctil con atajos de teclado, pagos híbridos (Efectivo, PagoMóvil, Zelle, Tarjetas)
- **Gestión de Inventario FEFO**: Trazabilidad por lote y fecha de vencimiento, alertas automáticas
- **Cumplimiento Fiscal SENIAT**: Facturación electrónica homologada, Z-Reports, control de estupefacientes
- **Multi-Moneda**: Soporte USD/VES con conversión automática usando tasa BCV
- **Servicios Clínicos**: Verificación de interacciones medicamentosas, reporte de reacciones adversas
- **Programas de Fidelización**: Multi-laboratorio (Pfizer, Novartis, etc.)
- **Modo Offline-First**: Operación continua sin internet, sincronización inteligente
- **Seguridad Avanzada**: RBAC, auditoría completa, encriptación AES-256
- **Reportes Completos**: X-Cut, Z-Report, ventas, inventario, rentabilidad

## 📋 Requisitos Previos

- Node.js 18+ 
- pnpm 8+
- Supabase account (gratuito)
- Git

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/your-org/red-salud.git
cd red-salud
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Crear Proyecto Supabase

Si ya tienes un proyecto Supabase, obtén el project ID. Si no:

```bash
# Instalar CLI de Supabase
npm install -g supabase

# Iniciar sesión
supabase login

# Crear proyecto (opcional - puedes usar la UI web)
supabase projects create --name red-salud --region us-east-1
```

### 5. Ejecutar Migraciones de Base de Datos

```bash
# Aplicar migraciones
supabase db push

# O aplicar migración específica
supabase migration up
```

### 6. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗂️ Estructura del Proyecto

```
red-salud/
├── apps/
│   ├── web/                    # Aplicación web principal (Next.js)
│   │   └── app/
│   │       ├── api/pharmacy/   # API Routes para módulos farmacéuticos
│   │       └── dashboard/farmacia/  # Dashboard de farmacia
│   ├── desktop/                # Aplicación desktop (Tauri)
│   └── mobile/                 # Aplicación móvil (Expo)
├── packages/
│   ├── core/                   # Lógica de negocio compartida
│   │   └── src/pharmacy/       # Módulos farmacéuticos
│   ├── types/                  # Definiciones TypeScript compartidas
│   └── ui/                     # Componentes UI compartidos
├── services/                   # Microservicios
├── supabase/
│   └── migrations/            # Migraciones de base de datos
└── docs/                       # Documentación
```

## 📦 Módulos Implementados

### Core Modules (packages/core/src/pharmacy/)

| Módulo | Archivo | Descripción |
|--------|---------|-------------|
| Inventario | `inventory.ts` | Gestión FEFO, alertas, transferencias |
| Moneda | `currency.ts` | Conversión USD/VES, tasa BCV |
| POS | `pos.ts` | Carrito, pagos, búsqueda productos |
| SENIAT | `sniat.ts` | Cumplimiento fiscal, Z-Reports |
| Proveedores | `suppliers.ts` | Comparación, órdenes de compra |
| Clínico | `clinical.ts` | Interacciones, reacciones adversas |
| Analytics | `analytics.ts` | Reportes, métricas |
| Seguridad | `security.ts` | RBAC, auditoría |
| Offline | `offline.ts` | Modo offline, sincronización |
| Fidelización | `loyalty.ts` | Programas de puntos |
| Servicios | `services.ts` | TAE, servicios médicos |
| Pedidos Especiales | `special-orders.ts` | Anticipo, tracking |
| Comercial | `commercial.ts` | Descuentos, combos |
| Consultas | `consultation.ts` | Atención farmacéutica |
| Delivery | `delivery.ts` | Entregas a domicilio |
| Consignación | `consignment.ts` | Gestión consignaciones |
| Caja Chica | `petty-cash.ts` | Gastos menores |
| Notificaciones | `notifications.ts` | SMS templates |

### API Routes (apps/web/app/api/pharmacy/)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/pharmacy/inventory` | GET/POST/PATCH/DELETE | Gestión de inventario |
| `/api/pharmacy/pos` | GET/POST/PATCH/DELETE | Operaciones POS |
| `/api/pharmacy/reports` | GET | Reportes (ventas, inventario, Z-Report) |

## 🎯 Flujo de Uso Rápido

### Para Cajeros (Hora Pico)

1. **Iniciar Sesión**: Login con credenciales de cajero
2. **Escanear Producto**: Usar lector de código de barras o buscar (F1)
3. **Agregar al Carrito**: Producto seleccionado con lote FEFO automático
4. **Procesar Pago**: F9 → Seleccionar método(s) de pago
5. **Confirmar**: Imprimir factura fiscal SENIAT

**Atajos Importantes**:
- F1: Buscar producto
- F4: Pausar carrito
- F5: Recuperar carrito
- F9: Cobrar
- F12: Limpiar

### Para Farmacéuticos

1. **Validar Receta**: Verificar receta médica
2. **Verificar Interacciones**: Sistema alerta automáticamente
3. **Dispensar Medicamento**: Selección lote FEFO
4. **Registrar Entrega**: Firma digital (estupefacientes)

## 🔐 Seguridad

### Autenticación

- Supabase Auth (JWT)
- Refresh tokens
- 2FA opcional para roles sensibles

### Autorización (RBAC)

| Rol | Permisos |
|-----|----------|
| CAJERO | POS básico, consulta stock |
| FARMACÉUTICO | Dispensación, validación recetas |
| SUPERVISOR | Anulaciones, auditoría |
| GERENTE | Configuración, reportes |
| ADMIN | Acceso total |

### Auditoría

- Todas las acciones registradas
- Logs inmutables (hash chain)
- Retención configurable (default 90 días)

## 📊 Reportes Disponibles

### X-Cut (Reporte Intermedio)
- Ventas del día actual
- Desglose por método de pago
- Total IVA crédito

### Z-Report (Cierre Fiscal Diario)
- Cierre fiscal diario
- Transmisión a SENIAT
- Reporte de estupefacientes

### Reportes de Ventas
- Por rango de fechas
- Por producto
- Por cliente

### Reportes de Inventario
- Niveles de stock
- Alertas de vencimiento
- Stock bajo

### Reportes de Rentabilidad
- Márgenes por producto
- Top 20 productos
- Análisis de costos

## 🌐 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel
```

### Docker

```bash
# Construir imagen
docker build -t red-salud .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  red-salud
```

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y desplegar
railway login
railway init
railway up
```

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests con coverage
pnpm test:coverage

# Tests E2E
pnpm test:e2e
```

## 📱 Módulos Adicionales

### Escaneo de Inventario Móvil

- Escaneo de código de barras con cámara
- Conteo de inventario
- Detección de discrepancias
- Modo offline

### Notificaciones SMS

- Confirmación de pedidos
- Actualizaciones de entrega
- Recordatorios de medicación
- Alertas de fidelización

### Delivery a Domicilio

- Zonas de entrega con pricing
- Tracking en tiempo real
- Asignación de repartidores
- Cálculo de comisiones

## 🔄 Sincronización Offline

El sistema opera completamente offline:

1. **Datos Locales**: IndexedDB para almacenamiento local
2. **Cola de Cambios**: Todas las operaciones se encolan
3. **Sync Inteligente**: Prioridad de ventas > inventario
4. **Resolución Conflictos**: Last-write-wins con detección
5. **Auto-Sync**: Al restaurar conexión

## 📞 Soporte

- **Documentación**: `/docs`
- **Issues**: GitHub Issues
- **Email**: support@red-salud.com

## 📄 Licencia

Proprietary - Todos los derechos reservados

## 🙏 Agradecimientos

- Supabase por la infraestructura backend
- Next.js por el framework web
- La comunidad de desarrolladores de Venezuela

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0  
**Estado**: Production Ready ✅
