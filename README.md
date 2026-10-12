# Sembrando Esperanza Web

Web pública de **Sembrando Esperanza 🕊**, desarrollada con React y Vite.

## Secciones y fuente de publicación

| Sección | Fuente pública |
| --- | --- |
| Planes bíblicos | Índice y detalle JSON `public/data/es/plans*` en GitHub |
| Historias | Índice y detalle JSON `public/data/es/stories*` en GitHub |
| Videos | Índice JSON `public/data/es/videos.json` en GitHub |
| Álbumes | Firestore, colección `albums`, campo `status: 'published'` |
| Versículos | Firestore, colección `verses`, campo `status: 'published'` |
| Oraciones | Firestore, colección `prayers`, campo `status: 'published'` |
| Inicio | Firestore, colección `homeSections`, último documento publicado |

Los índices JSON de historias y videos prevalecen cuando pueden consultarse. Si no son accesibles, se consulta Firestore como alternativa. Un índice JSON vacío **no** hace reaparecer contenidos de demostración. Ninguna de las secciones anteriores usa las colecciones fijas de `src/data/content.js` como fuente principal.

El administrador (`eler30mr-star/sembrando-esperanza-admin`) guarda registros en Firestore. Los planes, historias y videos también actualizan JSON a través de funciones protegidas de Vercel. Los cambios de álbumes, versículos, oraciones e inicio se leen directamente desde Firestore.

Para publicar un álbum, agrega una portada y una lista `images` de URL públicas (una por elemento) en el administrador. Para configurar el inicio, utiliza ID, slug, título o referencia de un contenido publicado: `planFeatured`, `storyFeatured`, `videoFeatured` y `verseFeatured`.

## Requisitos de despliegue

1. Configura en ambos proyectos de Vercel las mismas variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID` (y las demás variables Firebase que correspondan); ambos deben apuntar al **mismo proyecto Firebase**.
2. Revisa las reglas de Firestore: la web debe poder leer contenido publicado, **no** escribirlo sin autorización. Mantén cualquier lectura adicional que necesiten las funciones de interacción (me gusta, comentarios, etc.).
3. Configura `GITHUB_TOKEN` **solo en el servidor** del administrador, con permisos mínimos de escritura sobre el repositorio público.
4. Despliega ambas webs y verifica desde el navegador: publicar, editar, convertir a borrador, eliminar y consultar cada sección.
5. Los datos históricos de Firestore y los índices JSON existentes no se eliminaron ni migraron automáticamente. Si ambas fuentes contienen registros diferentes, haz una conciliación antes de una sincronización completa.

## Desarrollo y pruebas

```bash
npm install
npm run dev
npm test
npm run build
```

Los tests de selectores de contenido están en `tests/site-content.test.js`. La compilación y las pruebas contra Vercel/Firebase en producción deben realizarse después del despliegue.

## Copias de seguridad

Rama `backup/antes-reparacion-json-2026-10-12` conserva el estado previo de reparación. Los JSON válidos y los archivos no referenciados se conservaron, sin borrado masivo.
