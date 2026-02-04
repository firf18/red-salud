# Guía de Desarrollo - Red-Salud Farmacia Desktop

## Configuración Inicial

### 1. Instalar Dependencias

```bash
# Desde la raíz del monorepo
pnpm install

# O desde apps/desktop/farmacia
cd apps/desktop/farmacia
pnpm install
```

### 2. Instalar Rust (si no lo tienes)

**Windows:**
```bash
winget install Rustlang.Rustup
```

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase (opcional)
```

## Desarrollo

### Modo Desarrollo

```bash
# Iniciar en modo desarrollo (hot reload)
pnpm tauri:dev
```

Esto iniciará:
1. Vite dev server en `http://localhost:1420`
2. La aplicación Tauri con hot reload

### Solo Frontend (sin Tauri)

```bash
pnpm dev
```

Útil para desarrollo rápido de UI sin compilar Rust.

## Estructura del Código

### Frontend (React + TypeScript)

```
src/
├── layouts/           # Layouts de la aplicación
│   └── DashboardLayout.tsx
├── pages/            # Páginas principales
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── POSPage.tsx
│   ├── InventoryPage.tsx
│   └── ...
├── store/            # Estado global (Zustand)
│   ├── authStore.ts
│   └── cartStore.ts
├── lib/              # Utilidades
│   ├── supabase.ts
│   └── tauri.ts
├── App.tsx           # Router principal
└── main.tsx          # Punto de entrada
```

### Backend (Rust + Tauri)

```
src-tauri/
├── src/
│   └── main.rs       # Comandos y configuración
├── Cargo.toml        # Dependencias Rust
└── tauri.conf.json   # Configuración de la app
```

## Agregar Nuevas Funcionalidades

### 1. Agregar una Nueva Página

```typescript
// src/pages/NuevaPage.tsx
export default function NuevaPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Nueva Página</h1>
    </div>
  );
}
```

```typescript
// src/App.tsx
import NuevaPage from './pages/NuevaPage';

// Agregar ruta
<Route path="nueva" element={<NuevaPage />} />
```

### 2. Agregar un Comando de Tauri

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn mi_comando(parametro: String) -> Result<String, String> {
    Ok(format!("Recibido: {}", parametro))
}

// Registrar en invoke_handler
.invoke_handler(tauri::generate_handler![
    greet,
    get_system_info,
    mi_comando  // Agregar aquí
])
```

```typescript
// src/lib/tauri.ts
export async function miComando(parametro: string): Promise<string> {
  return await invoke('mi_comando', { parametro });
}
```

### 3. Agregar Estado Global

```typescript
// src/store/miStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MiState {
  valor: string;
  setValor: (valor: string) => void;
}

export const useMiStore = create<MiState>()(
  persist(
    (set) => ({
      valor: '',
      setValor: (valor) => set({ valor }),
    }),
    {
      name: 'mi-store',
    }
  )
);
```

## Base de Datos Local (SQLite)

### Crear Tablas

```typescript
import Database from '@tauri-apps/plugin-sql';

const db = await Database.load('sqlite:farmacia.db');

await db.execute(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL
  )
`);
```

### Consultas

```typescript
// Insertar
await db.execute(
  'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
  ['Paracetamol', 2.50, 100]
);

// Seleccionar
const productos = await db.select('SELECT * FROM productos');
```

## Compilación

### Desarrollo

```bash
pnpm tauri:dev
```

### Producción

```bash
# Compilar para tu sistema operativo
pnpm tauri:build

# Los instaladores se generan en:
# src-tauri/target/release/bundle/
```

### Compilación Multiplataforma

Para compilar para otros sistemas operativos, necesitas:
- **Windows**: Compilar en Windows
- **macOS**: Compilar en macOS
- **Linux**: Compilar en Linux

## Debugging

### DevTools

En modo desarrollo, las DevTools se abren automáticamente.

### Logs de Rust

```rust
println!("Debug: {:?}", variable);
```

Los logs aparecen en la consola donde ejecutaste `pnpm tauri:dev`.

### Logs de JavaScript

```typescript
console.log('Debug:', variable);
```

Los logs aparecen en las DevTools del navegador.

## Testing

### Frontend

```bash
# Agregar vitest
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

# Ejecutar tests
pnpm test
```

### Backend (Rust)

```bash
cd src-tauri
cargo test
```

## Optimización

### Reducir Tamaño del Bundle

1. **Vite**: Ya está optimizado con tree-shaking
2. **Rust**: Compilar en modo release
3. **Tauri**: Usar `strip = true` en Cargo.toml

```toml
[profile.release]
strip = true
opt-level = "z"
lto = true
codegen-units = 1
```

## Troubleshooting

### Error: "Rust not found"
```bash
rustup update
```

### Error: "WebView2 not found" (Windows)
Instalar WebView2 Runtime desde Microsoft

### Error de compilación de Rust
```bash
cd src-tauri
cargo clean
cargo build
```

### Hot reload no funciona
1. Verificar que Vite esté corriendo en puerto 1420
2. Reiniciar `pnpm tauri:dev`

## Recursos

- [Documentación de Tauri](https://tauri.app)
- [Documentación de React](https://react.dev)
- [Documentación de Zustand](https://zustand-demo.pmnd.rs)
- [Documentación de TailwindCSS](https://tailwindcss.com)

## Próximos Pasos

1. ✅ Estructura base creada
2. ⏳ Implementar conexión con Supabase
3. ⏳ Agregar base de datos SQLite local
4. ⏳ Implementar sincronización offline
5. ⏳ Agregar impresión de facturas
6. ⏳ Implementar lector de código de barras
7. ⏳ Agregar reportes en PDF
8. ⏳ Implementar backup automático
