# Yeska Essence — sitio + panel administrador

Sitio público (Astro) + panel de administración con login, conectados a una
base de datos propia en **Supabase**. La dueña edita productos, precios,
recordatorios y fotos desde `/admin` sin tocar código; el sitio público
muestra los cambios al instante.

## 1. Crear las tablas en Supabase

Ya tienes un proyecto creado. Entra a **SQL Editor → New query**, pega el
contenido completo de [`supabase-schema.sql`](./supabase-schema.sql) y dale
**Run**. Esto crea las tablas, la seguridad (RLS) y las 4 líneas de
producto (Flores, Botánica, Figuras, Recipientes).

## 2. Crear el usuario administrador

**Authentication → Users → Add user** → pon el correo y la contraseña que
usará la dueña para entrar a `/admin`. No necesitas registro público: este
es el único usuario que existirá.

## 3. Configurar las variables de entorno

```bash
cp .env.example .env
```

Abre `.env` y pega los dos valores de **Project Settings → API**:

```
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 4. Instalar dependencias

```bash
npm install
```

## 5. Cargar el catálogo actual (15 productos + 7 recordatorios)

Este paso sube las fotos que ya tenías a Supabase Storage y crea las filas
correspondientes — así no tienes que capturar todo a mano desde el panel.

El script ya lee `PUBLIC_SUPABASE_URL` de tu `.env` solo — lo único que
tienes que escribir en la terminal es la `service_role key` (nunca en un
archivo, porque a diferencia de la `anon key`, esta sí es secreta):

```powershell
# PowerShell (la terminal por defecto en Windows)
$env:SUPABASE_SERVICE_ROLE_KEY="pega-aqui-la-service-role-key"
npm run seed
```

```bat
:: cmd.exe
set SUPABASE_SERVICE_ROLE_KEY=pega-aqui-la-service-role-key
npm run seed
```

```bash
# Git Bash / macOS / Linux
export SUPABASE_SERVICE_ROLE_KEY=pega-aqui-la-service-role-key
npm run seed
```

La `service_role key` está en **Project Settings → API** — es la que dice
"secret", justo debajo de la `anon` / `public` key que ya tienes en `.env`.

> La variable solo dura mientras esa ventana de terminal esté abierta. Si
> la cierras y necesitas correr `npm run seed` otra vez, repite el paso.

## 6. Correr el sitio en tu máquina

```bash
npm run dev
```

- Sitio público: `http://localhost:4321`
- Panel admin: `http://localhost:4321/admin/login`

## 7. Publicarlo (Vercel)

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project → Import** ese repositorio.
3. Vercel detecta Astro automáticamente (adaptador `@astrojs/vercel` ya
   configurado en `astro.config.mjs`). En **Environment Variables**, agrega
   `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` (los mismos de tu `.env`).
4. Deploy. Los cambios que la dueña haga en `/admin` se ven en el sitio en
   vivo de inmediato — no hay que volver a publicar nada.
5. En **Settings → Domains**, conecta el dominio propio y actualiza el
   `site:` de `astro.config.mjs` para que coincida (lo necesitan el
   canonical, Open Graph y el sitemap).

> ¿Prefieres Netlify en vez de Vercel? Cambia el adaptador en
> `astro.config.mjs`: `npm i @astrojs/netlify` y reemplaza el import de
> `@astrojs/vercel` por `@astrojs/netlify`.

## Cómo editar el catálogo día a día

Entra a `tusitio.com/admin`, inicia sesión, y en **Productos**:

- **Clic en el nombre, el precio, la nota o los materiales** → se edita ahí
  mismo, sin abrir ningún formulario. Enter o clic afuera para guardar.
- **Clic en la foto** → sube una nueva.
- **El interruptor de "Visible"** → oculta un producto del sitio sin
  borrarlo (útil si se agota temporalmente).
- **"+ Nuevo producto"** → agrega uno desde cero.

**Recordatorios** funciona igual, con un botón ▸ para desplegar y editar
las opciones de precio (unidad / al mayor) de cada uno.

## Estructura del proyecto

```
src/
  lib/supabase.js       cliente de Supabase + helpers de formato de precio
  lib/authGuard.js       protege las páginas /admin (redirige si no hay sesión)
  layouts/AdminLayout.astro   barra lateral + logout, común a todo /admin
  styles/site.css         estilos del sitio público (el diseño ya aprobado)
  styles/admin.css        estilos del panel — paleta funcional, no decorativa
  pages/index.astro       sitio público: trae productos/recordatorios de Supabase
  pages/admin/login.astro
  pages/admin/index.astro         panel: resumen
  pages/admin/productos.astro     panel: CRUD con edición en línea
  pages/admin/recordatorios.astro panel: CRUD con opciones de precio anidadas
scripts/seed.mjs          siembra inicial (sube fotos + inserta el catálogo)
supabase-schema.sql       esquema completo, listo para pegar en Supabase
```

## Seguridad, en corto

- La protección real no es la pantalla de login — es que las políticas de
  la base de datos (RLS, en `supabase-schema.sql`) solo dejan **escribir**
  a un usuario que inició sesión. El login solo evita que alguien sin
  cuenta vea el panel.
- La `anon key` (en `.env` y en el sitio) está pensada para ser pública —
  así funciona Supabase. La `service_role key` (solo usada en
  `scripts/seed.mjs`, desde tu terminal) es la que nunca debe compartirse
  ni subirse a git.
