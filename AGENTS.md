# AGENTS.md

## Stack y configuración

- Quasar 2.34 (Vite, SPA, enrutado por hash) + Vue 3 + Pinia 4 + **Vue Router 5** + TypeScript (modo estricto).
- El gestor de paquetes es **pnpm** (`pnpm-lock.yaml`); Node >= 22.12. Usa `pnpm`, no npm/yarn.
- `.quasar/` se genera (con `quasar prepare` en el postinstall); `tsconfig.json` extiende `.quasar/tsconfig.json`. Ejecuta `pnpm install` antes de `typecheck`.
- No hay backend real: toda llamada a la API se mockea. `src/api/mock-backend.ts` es la única fuente de datos mock, latencia simulada (800 ms) y errores. Los stores de Pinia hacen las llamadas asíncronas y actualizan el estado; los componentes nunca tocan los mocks.
- No hay test runner configurado (sin script de test, sin vitest/jest).

## Comandos

- `pnpm dev` — servidor de desarrollo (abre el navegador automáticamente).
- `pnpm build` — build de producción; además hace typecheck vía `vite-plugin-checker` (vue-tsc).
- `pnpm typecheck` — `vue-tsc --noEmit`.
- `pnpm lint` — formatea con Prettier y corrige con ESLint.

Ojo: `pnpm lint:check` ejecuta `prettier` sin `--check`, así que vuelca cada archivo formateado a stdout (ruidoso y enorme) y no es una verificación real. Para validar el lint, ejecuta ESLint directamente:

```bash
npx eslint -c ./eslint.config.js "./src*/**/*.{ts,js,cjs,mjs,vue}"
```

## Arquitectura

- Módulos por feature: `src/features/<feature>/` co-localiza `pages/`, `stores/` y `types.ts`. No repartas páginas/stores en la estructura por defecto de Quasar (`src/pages` + `src/stores`).
- Carpetas transversales: `src/layouts/`, `src/router/`, `src/boot/` (boot files, listados en `quasar.config.ts` → `boot`), `src/stores/index.ts` (solo inicialización de Pinia), `src/api/` (mock backend).
- Alias: `@` → `src`, `#q-app` → tipos de Quasar app-vite (`defineBoot`, `defineRouter`, `defineStore`).

## Documentación

- Mantén `README.md` sincronizado con el código. Al agregar, renombrar o eliminar features/archivos, actualiza las secciones correspondientes del README — especialmente **"Estructura del proyecto"** (árbol de archivos) y **"Modelo de datos y tipado"** (tipos + supuestos), y también **"Hoja de ruta"** y **"Credenciales de acceso"** cuando cambien.

## Routing y autenticación

- Rutas: `login` (pública), `payment-methods` bajo `/` (MainLayout, `meta.requiresAuth`).
- El guard vive en `src/router/guards.ts` (`setupAuthGuard`), registrado en `src/router/index.ts`. Redirige a los no autenticados a `/login?redirect=...`.
- La sesión persiste en `localStorage`; `src/boot/auth.ts` la restaura al arrancar.
- El store de auth dispara errores globales vía Quasar `Notify` (nunca relanza a los componentes). Credenciales de login: `admin` / `admin123` (también en el README).

## Convenciones que difieren de los valores por defecto

- `@typescript-eslint/consistent-type-imports` es un error: los imports solo de tipos deben usar `import type`.
- TS es más estricto que el default: `exactOptionalPropertyTypes` y `noUncheckedIndexedAccess` están activos, por lo que el acceso por índice devuelve `T | undefined`.
- Los stores de features usan `defineStore` de `'pinia'` (con `acceptHMRUpdate`); solo `src/stores/index.ts` usa el `defineStore` de `#q-app` (el bootstrap de Pinia).
- Los componentes de Quasar se auto-importan; los plugins (`Notify`, `Dialog`) deben registrarse en `quasar.config.ts` → `framework.plugins` e importarse desde `'quasar'`.
- Comentarios: evalúa si de verdad aportan antes de escribirlos. Si se agregan, van en **español**, muy específicos, y solo en código lo bastante complejo como para justificarlo. El objetivo es que el código sea descriptivo por sí mismo (buenos nombres), no documentar cada línea.
