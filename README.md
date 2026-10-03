# 🏦 Prueba Técnica — Quasar + Vue

Aplicación SPA construida con **Quasar Framework** (Vite), **Vue 3** y **TypeScript**.
Implementa un flujo de **autenticación** (login/logout con protección de rutas) y una
vista base para la **gestión de métodos de pago**.

> ⚠️ **Sin backend real:** todas las llamadas a la API se simulan en el frontend mediante
> datos mockeados. La arquitectura, sin embargo, replica la de un entorno de producción.

---

## 📚 Tabla de contenidos

- [🧰 Stack tecnológico](#-stack-tecnológico)
- [✅ Requisitos previos](#-requisitos-previos)
- [🚀 Instalación y entorno local](#-instalación-y-entorno-local)
- [📦 Scripts disponibles](#-scripts-disponibles)
- [🔑 Credenciales de acceso (mock)](#-credenciales-de-acceso-mock)
- [🧱 Estructura del proyecto](#-estructura-del-proyecto)
- [🗂️ Modelo de datos y tipado](#️-modelo-de-datos-y-tipado)
- [🔐 Flujo de autenticación y seguridad](#-flujo-de-autenticación-y-seguridad)
- [🛣️ Hoja de ruta](#️-hoja-de-ruta)

---

## 🧰 Stack tecnológico

| Herramienta   | Versión        | Uso                                    |
| ------------- | -------------- | -------------------------------------- |
| Quasar        | `2.34.x`       | Framework UI (componentes, plugins)    |
| Vue           | `3.5.x`        | Framework reactivo                     |
| Vue Router    | `5.x`          | Enrutamiento y guards de navegación    |
| Pinia         | `4.x`          | Gestión de estado global               |
| TypeScript    | `6.x`          | Tipado estático (modo `strict`)        |
| Vite          | `8.x`          | Bundler / dev server (vía Quasar CLI)  |

---

## ✅ Requisitos previos

- **Node.js** `>= 22.12` (también `^24` o `>= 26`).
- **pnpm** como gestor de paquetes (el proyecto usa `pnpm-lock.yaml`).

Verifica tu entorno:

```bash
node --version
pnpm --version
```

---

## 🚀 Instalación y entorno local

### 1. Clonar e ingresar al proyecto

```bash
git clone <url-del-repositorio> prueba_tecnica_vue
cd prueba_tecnica_vue
```

### 2. Instalar dependencias

```bash
pnpm install
```

> ℹ️ Este paso ejecuta `quasar prepare` (postinstall), que genera la carpeta
> `.quasar/` con la configuración interna de TypeScript y los alias del proyecto.

### 3. Levantar el servidor de desarrollo

```bash
pnpm dev
```

El servidor se inicia en **http://localhost:9000** y abre el navegador
automáticamente. La app arranca en la pantalla de **login**.

### 4. Compilar para producción

```bash
pnpm build
```

Los archivos generados quedan en `dist/spa/`.

---

## 📦 Scripts disponibles

| Comando               | Descripción                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `pnpm dev`            | Inicia el servidor de desarrollo con HMR                            |
| `pnpm build`          | Compila la aplicación para producción (incluye typecheck)           |
| `pnpm typecheck`      | Verifica tipos con `vue-tsc --noEmit`                               |
| `pnpm lint`           | Formatea con Prettier y corrige con ESLint                          |
| `pnpm lint:check`     | Valida formato y reglas de lint sin modificar archivos              |

---

## 🔑 Credenciales de acceso (mock)

La autenticación usa datos simulados en el frontend (sin backend real).

| Usuario   | Contraseña  |
| --------- | ----------- |
| `admin`   | `admin123`  |

---

## 🧱 Estructura del proyecto

```text
src/
├── api/
│   └── mock-backend.ts          # Única fuente de datos mock + simulación de latencia/errores
├── boot/
│   └── auth.ts                  # Hidrata la sesión desde localStorage al arrancar
├── features/
│   ├── auth/
│   │   ├── pages/LoginPage.vue  # Pantalla de login
│   │   ├── stores/auth.store.ts # Store Pinia de autenticación
│   │   └── types.ts             # Tipos del dominio auth
│   └── payment-methods/
│       └── pages/PaymentMethodsPage.vue  # Vista (placeholder) de métodos de pago
├── layouts/
│   └── MainLayout.vue           # Layout protegido (header + logout)
├── router/
│   ├── guards.ts                # Guard global de autenticación (beforeEach)
│   ├── index.ts                 # Instancia del router
│   └── routes.ts                # Definición de rutas
└── stores/
    └── index.ts                 # Bootstrap de Pinia
```

> El proyecto usa una organización **por feature/dominio** (`src/features/`), que
> co-localiza página, store y tipos de cada módulo.

---

## 🗂️ Modelo de datos y tipado

Los supuestos del modelo de negocio se tipan en cada feature. Actualmente el dominio
de **autenticación** define:

```ts
// src/features/auth/types.ts

interface AuthUser {
  id: string;      // Identificador único del usuario
  name: string;    // Nombre visible
  email: string;   // Correo (dato de presentación, no es el campo de login)
}

interface LoginCredentials {
  username: string; // Nombre de usuario usado para autenticar
  password: string;
}

interface AuthSession {
  token: string;    // Token simulado (JWT de juguete)
  user: AuthUser;
}
```

### Supuestos adoptados

| Supuesto                                  | Decisión                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Campo de acceso                           | Se autentica por **`username`** (no por email), valor `admin`             |
| Token de sesión                           | Cadena simulada (`mock-jwt-token-admin`), sin expiración real             |
| Persistencia de sesión                    | `token` y `user` se guardan en `localStorage` (`auth.token`, `auth.user`) |
| Latencia simulada                         | `800 ms` de retardo en cada respuesta del mock                            |
| Errores del mock                          | Credenciales inválidas → la promesa se **rechaza** con un `Error`        |

---

## 🔐 Flujo de autenticación y seguridad

1. **Acceso inicial:** la app arranca en `/login`; cualquier ruta protegida
   (`meta.requiresAuth`) redirige a `/login?redirect=<ruta>`.
2. **Login:** el componente envía las credenciales al store; el store realiza la
   llamada asíncrona al mock y actualiza el estado global. En caso de fallo, dispara
   una alerta global con Quasar `Notify`.
3. **Guard de rutas:** `src/router/guards.ts` valida en cada navegación si existe una
   sesión activa; si no, redirige al login.
4. **Logout:** desde el header (`MainLayout`) se solicita confirmación y, al aceptar,
   se destruye la sesión y se redirige a `/login`.
5. **Persistencia:** al recargar la página, `src/boot/auth.ts` restaura la sesión desde
   `localStorage`.

---

## 🛣️ Hoja de ruta

- [x] Pantalla de login con validación y estados de carga.
- [x] Protección de rutas (guards) y redirección al login.
- [x] Cierre de sesión con confirmación.
- [ ] Lista y gestión completa de métodos de pago (CRUD con store + mock).

---

## ⚙️ Configuración

La configuración principal de Quasar se encuentra en `quasar.config.ts`.
Consulta la [documentación oficial](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file)
para más opciones.
