# ArqSoft-Proyecto-FrontEnd — Grupo 1 (Frontend + BFF)

Frontend del Mini-Marketplace (UTEM). React + Vite, desplegado en Vercel.
Consume el **BFF** (repo separado `Grupo-1-BFF`, desplegado en Render), que a su
vez orquesta los servicios de los grupos 2–8.

- **Frontend (este repo):** React 18 + Vite 5 + React Router 7 + Tailwind 4.
- **BFF:** `https://grupo-1-bff.onrender.com` (repo `Grupo-1-BFF`, no este).

---

## Despliegue y CI/CD

> **Estado honesto para evaluación (E3 Cloud):** este proyecto usa **deploy
> automatizado por plataforma** (auto-deploy nativo de Vercel y Render al hacer
> push), **no un pipeline de CI/CD propio**. No existe `.github/workflows/` ni
> ninguna otra automatización de tests/lint previa al despliegue. Lo único que
> corre automáticamente antes de publicar es el **build de Vite en Vercel**; si
> el build falla, el deploy no se promueve. Esto es un *build check*, no una
> suite de CI. Se documenta tal cual es, sin inflar el alcance.

### 1. Cómo se despliega hoy cada servicio

| Servicio | Plataforma | Trigger | Pasos automáticos | Pasos manuales | Build aprox. |
|---|---|---|---|---|---|
| **Frontend** (este repo) | Vercel | `git push` a `main` | `npm install` → `npm run build` (`vite build`) → publica `dist/` en CDN | Ninguno en flujo normal | ~1–2 min |
| **BFF** (`Grupo-1-BFF`) | Render | `git push` a `main` del repo BFF | Build del servicio (Docker) y arranque | Ninguno en flujo normal | ~2–5 min + *cold start* en plan free |

**Frontend (Vercel):**
- El repo está conectado al proyecto de Vercel de la organización
  `Mini-Marketplace-Cloud-UTEM`. Cada push a `main` dispara un **deploy de
  producción**; cada push a otra rama o PR genera un **Preview Deploy** con URL
  propia (comportamiento por defecto de Vercel, no configurado por nosotros).
- Vercel detecta Vite automáticamente: comando de build `vite build`, directorio
  de salida `dist/`. **No hay `vercel.json`** en el repo — toda la config vive en
  el dashboard de Vercel (preset Vite por defecto).
- `dist/` está en `.gitignore`: el build lo produce Vercel, no se commitea.

**BFF (Render):**
- Repo separado (`Grupo-1-BFF`). Auto-deploy al push a su `main`. La
  configuración real (Docker, variables, comando de arranque) vive en ese repo y
  en el dashboard de Render, **no aquí**.
- En plan free, el servicio se duerme tras inactividad → la primera petición
  tras el sueño tarda varios segundos (*cold start*); puede parecer un error de
  red/CORS transitorio que se resuelve al reintentar.

### 2. ¿Hay CI (tests / lint automatizados)?

**No.** Estado verificado del repo:
- No existe `.github/workflows/` ni ningún otro runner de CI.
- `package.json` solo define `dev`, `build` y `preview`. **No hay script de
  test ni de lint**, por lo tanto no hay nada que un CI pudiera ejecutar hoy.
- La única validación previa al deploy es que **`vite build` compile sin
  errores** en Vercel. Si falla, Vercel marca el deploy como fallido y **mantiene
  en línea la última versión que sí compiló**.

> Mejora futura (no implementada): agregar un workflow de GitHub Actions que
> corra lint/build (y tests cuando existan) en cada PR antes de permitir el
> merge a `main`.

### 3. Variables de entorno

Se configuran en el **dashboard de cada plataforma**, nunca en el repo.

| Servicio | Variable | Valor | Dónde se configura |
|---|---|---|---|
| Frontend | `VITE_BFF_URL` | `https://grupo-1-bff.onrender.com` | Vercel → Project → Settings → Environment Variables |
| BFF | (las suyas) | — | Render dashboard del repo `Grupo-1-BFF` |

- En Vite, **solo** las variables con prefijo `VITE_` quedan expuestas al cliente
  (se inyectan en build time). Cambiar `VITE_BFF_URL` requiere **redeploy** para
  que tome efecto (no es runtime).
- Plantilla en [`.env.example`](.env.example). Para desarrollo local, copiarla a
  `.env` (gitignoreado por el patrón `*.local` / `.env` no se commitea).

### 4. Reproducir el deploy desde cero

**Local (desarrollo):**
```bash
git clone https://github.com/Mini-Marketplace-Cloud-UTEM/Grupo-1-Front.git
cd Grupo-1-Front
npm install
cp .env.example .env        # ajustar VITE_BFF_URL si se apunta a otro BFF
npm run dev                 # http://localhost:5173
```

**Build de producción local (lo mismo que corre Vercel):**
```bash
npm run build               # genera dist/
npm run preview             # sirve dist/ localmente para verificar
```

**Desplegar en Vercel desde cero (si hubiera que reconectar el proyecto):**
1. Importar el repo en Vercel (preset **Vite**, se detecta solo).
2. Agregar la variable `VITE_BFF_URL` en Settings → Environment Variables.
3. Deploy. A partir de ahí, cada push a `main` redeploya automáticamente.

> Nota: tras reconectar el repo a la organización hubo que forzar un redeploy una
> vez (commit `03d0ab8`). Si Vercel deja de disparar deploys automáticos, revisar
> que el Git integration del proyecto siga apuntando a este repo.

### 5. Rollback

No hay rollback automatizado (no hay CI que lo gestione). Es **manual vía
dashboard**:

- **Vercel (Frontend):** Deployments → elegir un deploy previo que estaba sano →
  **Promote to Production** (o *Instant Rollback*). Cada deploy queda inmutable y
  con su propia URL, así que volver atrás es inmediato y sin rebuild.
- **Render (BFF):** dashboard del servicio → pestaña de Deploys → **Rollback** al
  deploy anterior, o re-deploy de un commit previo.
- Alternativa por Git: `git revert <commit>` y push a `main` dispara un nuevo
  deploy con el estado revertido.

---

## Estructura

- `src/` — código de la app (páginas, componentes, contextos `AuthProvider` /
  `CartProvider`).
- `index.html` / `vite.config.js` — entrada y configuración de Vite.
- `CLAUDE.md` — contexto persistente del proyecto (arquitectura, contratos,
  estado de integración por grupo).
- `arquitectura-frontend-y-despliegue.md` — esquema de arquitectura (diseño).
