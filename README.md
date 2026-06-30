# Procesador Seguro de Imágenes IA

App React para limpiar metadatos EXIF y ofuscar marcas de agua en imágenes generadas por IA. Todo el procesamiento ocurre en el navegador (client-side).

## Funciones

- Elimina metadatos EXIF al redibujar en Canvas
- Inyección de ruido fino configurable
- Ajuste de contraste
- Vista previa antes/después
- Descarga en PNG sanitizado

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy Railway (proyecto separado)

**En vivo:** https://procesador-imagenes-ia-production.up.railway.app

1. Crea un **nuevo proyecto** en [Railway](https://railway.com) y conéctalo a este repo (`jeova33/procesador-imagenes-ia`).
2. Railway detecta `nixpacks.toml` y ejecuta `npm run build` + `npm start`.
3. Health check: `GET /api/health`
4. El procesamiento sigue siendo **100% client-side**; el servidor solo sirve archivos estáticos.

```bash
# CLI (desde la carpeta del proyecto, vinculado al servicio Railway)
npm install
npx @railway/cli link    # elige el proyecto nuevo
npm run deploy:railway
```

Variables opcionales:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` (ya en nixpacks.toml) |
| `PORT` | Lo asigna Railway automáticamente |

## Deploy GitHub Pages

```bash
npm run deploy
```

## Formatos soportados

JPG, PNG, WEBP — máximo 10 MB