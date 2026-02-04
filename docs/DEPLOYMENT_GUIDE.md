# Guía de Despliegue en Producción

## Despliegue en Vercel (Recomendado)

### 1. Preparación

```bash
# Asegúrate de tener las dependencias instaladas
pnpm install

# Construir el proyecto para verificar
pnpm build
```

### 2. Configurar Supabase

```bash
# Instalar CLI de Supabase
npm install -g supabase

# Login
supabase login

# Conectar al proyecto existente
supabase link --project-ref hwckkfiirldgundbcjsp

# Aplicar migraciones
supabase db push
```

### 3. Configurar Variables de Entorno en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar por primera vez
vercel

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 4. Despliegue Producción

```bash
# Desplegar a producción
vercel --prod
```

### 5. Configurar Dominio Personalizado (Opcional)

1. Ve a dashboard de Vercel
2. Selecciona el proyecto
3. Settings → Domains
4. Agrega tu dominio
5. Configura DNS según instrucciones

---

## Despliegue en Railway

### 1. Preparación

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### 2. Crear Proyecto

```bash
# Inicializar proyecto
railway init

# Agregar variables de entorno
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Configurar build command
railway variables set BUILD_COMMAND=pnpm build

# Configurar start command
railway variables set START_COMMAND=pnpm start
```

### 3. Desplegar

```bash
# Subir código
railway up

# Desplegar a producción
railway up --production
```

---

## Despliegue en Docker

### 1. Crear Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Construir Imagen

```bash
docker build -t red-salud-pharmacy .
```

### 3. Ejecutar Contenedor

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  red-salud-pharmacy
```

### 4. Desplegar en Docker Hub

```bash
# Tag image
docker tag red-salud-pharmacy yourusername/red-salud-pharmacy:latest

# Push to Docker Hub
docker push yourusername/red-salud-pharmacy:latest
```

---

## Configuración de Base de Datos en Producción

### 1. Crear Usuario de Base de Datos

```sql
-- Conectarte a Supabase SQL Editor
CREATE USER pharmacy_app WITH PASSWORD 'secure_password';

-- Otorgar permisos
GRANT USAGE ON SCHEMA public TO pharmacy_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pharmacy_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pharmacy_app;
```

### 2. Configurar Row Level Security (RLS)

```sql
-- Asegúrate de que RLS esté habilitado
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
```

### 3. Crear Funciones de Seguridad

```sql
-- Función para verificar si el usuario tiene acceso al almacén
CREATE OR REPLACE FUNCTION has_warehouse_access(warehouse_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pharmacy_users
    WHERE id = auth.uid()
    AND id IN (
      SELECT user_id FROM warehouse_users WHERE warehouse_id = has_warehouse_access.warehouse_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Configuración de SSL y HTTPS

### Vercel (Automático)

Vercel maneja SSL automáticamente. No se requiere configuración adicional.

### Railway (Automático)

Railway proporciona SSL gratuito. No se requiere configuración adicional.

### Docker con Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoreo y Logging

### 1. Configurar Supabase Logs

```bash
# Ver logs de Supabase
supabase functions logs

# Ver logs específicos
supabase db logs
```

### 2. Configurar Vercel Analytics

```bash
# Instalar package
pnpm add @vercel/analytics

# Agregar a layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Configurar Sentry para Error Tracking

```bash
# Instalar Sentry
pnpm add @sentry/nextjs

# Inicializar Sentry
npx @sentry/wizard@latest -i nextjs
```

---

## Backup y Restore

### 1. Backup Automático (Supabase)

Supabase proporciona backups automáticos. Para configurar:

1. Ve a dashboard de Supabase
2. Settings → Database
3. Backups
4. Configura frecuencia de backups

### 2. Backup Manual

```bash
# Exportar base de datos
supabase db dump -f backup.sql

# Restaurar base de datos
supabase db restore -f backup.sql
```

### 3. Backup de Archivos

```bash
# Backup de archivos estáticos
tar -czf public-backup.tar.gz public/
```

---

## Escalado y Performance

### 1. Configurar Caching

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=30'
          }
        ]
      }
    ];
  }
};
```

### 2. Configurar CDN

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  }
};
```

### 3. Optimización de Build

```json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build"
  }
}
```

---

## Seguridad en Producción

### 1. Configurar CORS

```typescript
// app/api/pharmacy/route.ts
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### 2. Configurar Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### 3. Validar Input en API Routes

```typescript
import { z } from 'zod';

const schema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = schema.parse(body);
  // ... rest of code
}
```

---

## Checklist de Pre-Producción

- [ ] Variables de entorno configuradas
- [ ] Migraciones de base de datos aplicadas
- [ ] SSL/HTTPS configurado
- [ ] Row Level Security habilitado
- [ ] Rate limiting configurado
- [ ] Error tracking (Sentry) configurado
- [ ] Analytics configurado
- [ ] Backups automáticos activados
- [ ] Monitoreo configurado
- [ ] Dominio personalizado configurado
- [ ] Email de notificaciones configurado
- [ ] Tests pasados
- [ ] Performance audit completado
- [ ] Security audit completado
- [ ] Documentación actualizada

---

## Troubleshooting

### Problema: Error de Conexión a Supabase

```bash
# Verificar URL y keys
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Probar conexión
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/?apikey=$NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

### Problema: Build Fallido

```bash
# Limpiar caché
rm -rf .next
rm -rf node_modules

# Reinstalar dependencias
pnpm install

# Reconstruir
pnpm build
```

### Problema: Error de RLS

```sql
-- Deshabilitar RLS temporalmente para debugging
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Re-habilitar después
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

---

## Soporte

Para problemas de despliegue:
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- Supabase: https://supabase.com/docs
- Docker: https://docs.docker.com
