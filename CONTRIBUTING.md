# Guía de contribución — Grupo 1 (Front)

## Flujo de ramas

Trabajamos con tres ramas de larga vida:

| Rama   | Para qué | Despliegue |
|--------|----------|------------|
| `Dev`  | Integración diaria. Acá se junta el trabajo de todos. | Preview de Vercel |
| `QA`   | Validación / pruebas antes de producción. | Preview de Vercel (URL de QA) |
| `main` | Producción. Solo entra lo ya probado. | Producción (Vercel auto-deploy) |

Promoción en un solo sentido:

```
feature/mi-cambio  →  Dev  →  QA  →  main
```

### Cómo trabajar una tarea

1. Actualiza `Dev`: `git checkout Dev && git pull`.
2. Crea tu rama desde `Dev`: `git checkout -b feature/lo-que-haces`.
3. Trabaja y commitea. Antes de subir, corre localmente lo mismo que el CI:
   ```bash
   npm run lint
   npm run build
   ```
4. Sube tu rama y abre un **Pull Request hacia `Dev`** (no hacia `main`).
5. El **CI** (GitHub Actions) corre solo en el PR: instala, `lint` y `build`.
   Si sale ✗ rojo, arréglalo antes de pedir revisión.
6. Con el PR aprobado y el CI en verde, se mergea a `Dev`.

### Promover a QA / producción

- **`Dev → QA`**: PR cuando hay algo listo para probar. Se valida en la URL de QA.
- **`QA → main`**: PR cuando QA está OK. Al mergear, Vercel/Render despliegan a
  producción automáticamente.

## Reglas de protección (configurar en GitHub → Settings → Branches)

En `main` y `QA`:
- Requerir Pull Request antes de mergear (prohibir push directo).
- Requerir que el check de CI (**build**) esté en verde.

> Nota: Vercel y Render despliegan solos al actualizar `main`; **eso no es
> nuestro CI**. El CI es el workflow de GitHub Actions (`.github/workflows/ci.yml`)
> que valida el código en cada push/PR. Son cosas distintas y complementarias.

## Convenciones de código

- El frontend **solo** habla con nuestro BFF (`VITE_BFF_URL`, rutas `/v1/...`),
  nunca directo a otro grupo.
- Toda llamada de red pasa por `src/api.js` (`bffFetch`): tiene timeout, adjunta
  el JWT y parsea el error estándar `{ code, message }`.
- Nada de datos inventados en la UI: si el dato no viene del BFF, no se muestra.
