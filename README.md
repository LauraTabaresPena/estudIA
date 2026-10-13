# Study Companion

Aplicación de estudio en español con React, Vite, TypeScript, Tailwind CSS y Supabase. El proyecto está implementado: no es necesario volver a ejecutar `create-vite` sobre esta carpeta.

## 1. Base de datos: empieza aquí

Abre **SQL Editor → New query** en tu proyecto de Supabase, copia el contenido completo de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**. Ejecútalo **una vez en un proyecto nuevo**; no reemplaza tablas preexistentes.

El script crea:

| Tabla | Contenido | Acceso |
| --- | --- | --- |
| `public.users` | ID de `auth.users` y fecha de creación del perfil | Leer e insertar el perfil propio |
| `public.study_plans` | Un hito por fila: título, Markdown/HTML, orden y fecha de finalización | Leer, crear, editar y eliminar hitos propios |
| `public.pomodoro_logs` | UUID del ciclo, usuario, tipo, segundos, inicio y finalización | Leer e insertar ciclos propios |

`auth.users` y las contraseñas pertenecen a **Supabase Auth**. No guardamos contraseñas en `public.users`. El perfil se crea al abrir el espacio autenticado, mediante un `upsert` que ignora duplicados; no se requiere un trigger con privilegios elevados.

Las tres tablas tienen RLS, permisos explícitos y políticas basadas en `(select auth.uid())`. La política de edición valida tanto `USING` como `WITH CHECK`, por lo que no permite transferir un hito a otro usuario. Los registros de tiempo son inmutables para el cliente. La PK compuesta de los hitos y el índice de los ciclos permiten consultar por usuario eficientemente.

Para revisar las políticas en SQL Editor:

```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('users', 'study_plans', 'pomodoro_logs')
order by tablename, policyname;

select relname, relrowsecurity
from pg_class
where oid in ('public.users'::regclass, 'public.study_plans'::regclass,
              'public.pomodoro_logs'::regclass);
```

## 2. Configuración inicial

Requisitos: **Node.js 22.12 o superior**. Las dependencias están fijadas en `package.json`; `pnpm-lock.yaml` permite reproducir la instalación.

Desde PowerShell:

```powershell
Set-Location 'E:\Programación\study-companion'
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
```

Edita `.env.local` con los valores de tu proyecto (**Connect** o **Settings → API Keys**):

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE_PUBLICA
```

Usa la clave **publishable**. No introduzcas `service_role` ni claves `sb_secret_`: cualquier variable `VITE_*` es pública en el navegador. El cliente rechaza claves con otros formatos. `.env.local` está excluido de Git.

En **Authentication** de Supabase:

1. Activa el proveedor **Email** con contraseña. Mantén la confirmación de correo si la necesitas.
2. En **URL Configuration**, configura **Site URL** como `http://127.0.0.1:5173` durante desarrollo.
3. Añade `http://127.0.0.1:5173` a **Redirect URLs**. Si usas `localhost`, añade también `http://localhost:5173`.
4. Para producción, cambia Site URL a tu dominio HTTPS y añade ese origen a Redirect URLs. Usa los dominios concretos de tus previews si vas a probar el registro en ellos.

Arranca:

```powershell
pnpm dev
```

Abre la URL impresa en terminal, normalmente `http://127.0.0.1:5173`. Reinicia Vite después de cambiar `.env.local`.

Sin estas variables la aplicación funciona en **modo local**. El botón de acceso explica la configuración pendiente. Al conectar Supabase aparecen el registro, el acceso por correo y contraseña y el cierre de sesión. La confirmación de registro se muestra explícitamente cuando Supabase todavía no devuelve una sesión.

## 3. Personaliza el contenido

### Fondos

Pon tus imágenes en **`assets/images/`**, en la raíz del proyecto:

```text
assets/images/biblioteca.webp
assets/images/tarde-de-lluvia.jpg
assets/images/mi-escritorio.avif
```

Se admiten `.webp`, `.avif`, `.jpg`, `.jpeg` y `.png`, con extensiones en minúsculas. Se incluyen automáticamente en el selector **Hazlo tuyo → Tu fondo**. Vuelve a compilar al añadir imágenes. Se recomienda WebP/AVIF con dimensiones ajustadas y un peso aproximado inferior a 500 KB por fondo.

La ilustración vectorial de respaldo está en `public/assets/images/garden.svg`, servida en `/assets/images/garden.svg`. Funciona sin descargar fotografías externas. Los temas Jardín, Atardecer y Noche cambian el ambiente y la legibilidad de los paneles.

### YouTube

Edita [`src/config/media.ts`](src/config/media.ts). Ya incluye los **seis IDs únicos** proporcionados; `XbmvRfaufeE` aparecía dos veces. Los títulos visibles son etiquetas editoriales que puedes cambiar, no metadatos obtenidos de YouTube.

```ts
{ id: 'XbmvRfaufeE', title: 'Mi música', subtitle: 'Para concentrarme', kind: 'video', color: 'moss' }
{ id: 'PL_TU_PLAYLIST', title: 'Mi playlist', subtitle: 'Mi colección', kind: 'playlist', color: 'peach' }
```

El iframe de `youtube-nocookie.com` se crea solo al seleccionar contenido, reduciendo la carga inicial. No se fuerza autoplay: el usuario controla la reproducción desde el iframe. La reproducción continúa al regresar a la pestaña de selección y se detiene al cambiar de vídeo. El enlace **Abrir en YouTube** permite acceder al contenido cuando su propietario impide insertarlo. Su disponibilidad y permisos dependen de YouTube.

### Plan de estudio

La plantilla local vive en [`src/config/study.ts`](src/config/study.ts). Cada hito puede editarse, expandirse, completarse o eliminarse. Las cuentas nuevas comienzan con un plan vacío: añade sus hitos desde la interfaz.

En los detalles puedes pegar Markdown o HTML. `marked` convierte el Markdown y `DOMPurify` filtra el resultado mediante una lista de etiquetas y atributos permitidos. No se permiten scripts, estilos, eventos inline, formularios, iframes ni imágenes externas. Sí se admiten títulos, listas, enlaces, bloques de código y tablas.

## 4. Comportamiento y persistencia

- El Pomodoro admite entre **1 y 180 minutos** por tipo de ciclo. Las pausas son manuales: no empiezan sin intervención.
- El tiempo restante se calcula con una fecha límite, no descontando ticks; se recupera tras recargar. Una pausa detiene el cómputo. Los ciclos reiniciados o abandonados no suman tiempo.
- Solo se registran **ciclos completados**. Se guardan tanto foco como descansos; las estadísticas de hoy cuentan únicamente el foco. Se usa la fecha local del navegador.
- El aviso sonoro usa Web Audio con tres notas breves, sin descargar archivos. Requiere interacción del usuario y que el navegador permita audio. Con la página cerrada o el dispositivo suspendido no se pueden emitir alertas puntuales; al volver se reconcilia el ciclo vencido.
- El UUID se conserva durante pausa y recarga. La clave primaria impide duplicar un ciclo si se reintenta una petición cuya respuesta se perdió.
- El espacio local y cada cuenta usan claves distintas de almacenamiento. El plan de invitado **no se transfiere automáticamente** a una cuenta.
- Los cambios autenticados se guardan en una cola local antes de enviarse. Se reintenta al recuperar conexión, volver a la pestaña o pulsar el estado de sincronización. Los errores se muestran sin fingir que los datos están guardados en la nube.
- La lectura remota pagina todas las filas, evitando el límite de 1.000 registros por respuesta. No requiere activar Supabase Realtime.
- Con dos dispositivos editando el mismo hito, prevalece la última escritura recibida por el servidor. La aplicación está pensada para mantener una pestaña de estudio activa por cuenta.
- Si el navegador bloquea o agota `localStorage`, aparece un aviso. Evita borrar datos del sitio mientras existan cambios pendientes de sincronizar.

## 5. Comprobación

```powershell
pnpm test
pnpm build
pnpm preview
```

Las pruebas comprueban fechas límite, pausa/reanudación, recargas, validación de duraciones, filtrado XSS y las políticas SQL. El esquema se ejecuta realmente en PostgreSQL mediante PGlite; se simulan únicamente los roles y `auth.uid()` que proporciona Supabase. Estas pruebas no sustituyen una prueba con un proyecto de Supabase conectado.

Para validar la integración remota después de configurar las variables:

1. Crea una cuenta A, confirma su correo, entra y añade un hito.
2. Márcalo como completado, recarga y comprueba que sigue marcado.
3. Configura un ciclo de un minuto, complétalo y comprueba `pomodoro_logs` en Supabase. Recarga: debe seguir habiendo una sola fila para ese ciclo.
4. Cierra sesión y entra con una cuenta B. No deben aparecer los hitos ni los ciclos de A.
5. Desconecta la red, cambia un hito, vuelve a conectar y comprueba el estado de sincronización y la fila remota.

## 6. Despliegue en Vercel

La configuración está en [`vercel.json`](vercel.json). No hay servidor Node ni funciones necesarias en producción: Vercel sirve `dist` y el navegador se conecta directamente a Supabase con RLS.

1. Sube esta carpeta a un repositorio Git e impórtalo en Vercel.
2. Selecciona el directorio raíz de esta aplicación y el preset **Vite**.
3. Usa `pnpm install --frozen-lockfile` como comando de instalación, `pnpm build` como build y `dist` como salida.
4. Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` a los entornos que vayas a desplegar. Son variables de compilación; cambiarlas requiere un nuevo despliegue.
5. Configura el dominio final en Supabase Auth como se describe arriba y despliega.

`packageManager` fija pnpm 11.25.0. La configuración `nodeLinker: hoisted` permite instalar también en unidades exFAT de Windows sin enlaces simbólicos.

## Estructura

```text
assets/images/             Tus fondos
public/assets/images/      Ilustración de respaldo
src/components/            Paneles, modales e iconos SVG
src/config/                Hitos iniciales, medios y temas
src/hooks/                 Auth, progreso y temporizador
src/lib/                   Supabase, tiempo, sonido y saneado HTML
src/App.tsx                Layout y estadísticas
src/styles.css             Tailwind, cristal y diseño adaptable
supabase/schema.sql        SQL completo para el panel
tests/                     Pruebas de lógica, seguridad y SQL
```

CSS gestiona las transiciones y respeta `prefers-reduced-motion`; no se añade Framer Motion para reducir dependencias. Los iconos son SVG locales con degradados, las tipografías son del sistema y el editor Markdown se carga en un fragmento separado.

Referencias oficiales consultadas: [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite), [Auth con contraseña](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).
