# Plataforma Mobile (Flutter)

Este directorio agrupa todas las aplicaciones móviles inspiradas en los dashboards web de Red Salud. La primera app incluida es la adaptación del **dashboard de paciente**, construida con Flutter y estructurada para escalar hacia nuevas experiencias (secretaría, médico, turismo médico, etc.).

## Estructura

```
mobile/
├── apps/                     # Aplicaciones independientes
│   └── paciente_dashboard/    # Primera app Flutter
├── packages/                 # Librerías compartidas (UI, temas, SDKs)
│   └── design_system/
└── tooling/                  # Scripts y automatización futura (Melos, CI local)
```

La filosofía es tipo _monorepo_. Cada app o paquete vive en su propia carpeta con dependencia declarada en `melos.yaml` para ejecutar comandos en conjunto (`melos bootstrap`, `melos run analyze`, etc.).

## Requisitos

1. Flutter 3.24+ y Dart 3.4+ configurados en la máquina local.
2. Melos (`dart pub global activate melos`) si se desea ejecutar comandos orquestados.
3. Acceso a las APIs del backend (Supabase) o al gateway que utilice la versión web para compartir capa de datos.

## Flujo sugerido

1. Duplicar el `.env.example` web dentro de `apps/paciente_dashboard` (se proveerá cuando tengamos endpoints móviles definitivos).
2. Ejecutar `melos bootstrap` para instalar dependencias en apps y paquetes.
3. Entrar a la app deseada (`cd mobile/apps/paciente_dashboard`) y correr:

```bash
flutter pub get
flutter run
```

4. Para mantener paridad con la web, reutilizar módulos compartidos dentro de `packages/`. El paquete `design_system` expone componentes reutilizables basados en el branding oficial.

## Expansión futura

- `apps/secretaria_dashboard`: seguimiento de agenda y coordinación.
- `apps/medico_dashboard`: versión nativa del panel médico.
- `packages/data_providers`: SDK compartido para Supabase/REST.
- `tooling/fastlane`: automatización de build y subida a stores.

> **Nota**: La carpeta `mobile/` está ignorada en Git por defecto para permitir iteraciones rápidas locales sin afectar el repositorio principal. Quita la regla de `.gitignore` si se desea versionar el código móvil.
