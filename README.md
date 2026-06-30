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

## Formatos soportados

JPG, PNG, WEBP — máximo 10 MB