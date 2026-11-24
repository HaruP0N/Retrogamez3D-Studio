# Capa3D — Impresión 3D en PLA

## Ejecutar en tu PC
Instala Node.js 22 y Git. Descomprime el ZIP y abre una terminal dentro de `capa3d`:

```sh
npm install
npm run dev -- --port 8080
```
Abre http://localhost:8080. El ZIP incluye un `.env` oculto con las variables públicas de conexión actuales. Si descargaste desde GitHub, copia `.env.example` como `.env` y completa sus valores. No pongas claves privadas en variables `VITE_`.

**La web local y Vercel usan los mismos datos de Lovable Cloud**: editar desde esas webs modifica el catálogo compartido, no una copia local.

## Catálogo y panel
Las imágenes de Decoración, Figuras y coleccionables y Piezas funcionales abren el catálogo filtrado por su categoría. La selección queda en la dirección y se conserva al recargar.

En `/admin` → Productos agrega objetos con nombre, precio, imagen y categoría. El tag determina su listado. Las portadas existentes tienen marcada **Portada de categoría** y no se mezclan con los objetos a la venta. Puedes cambiar su foto o convertirlas en productos desmarcando esa opción.

Al preparar esta entrega solo existen las tres portadas iniciales: las categorías están vacías hasta que agregues objetos reales. No se inventaron productos. Solo se ofrece PLA.

El panel también incluye inventario de PLA, galería y proyectos. La configuración actual asigna administración a las dos primeras cuentas creadas; no gastes esos cupos en cuentas de prueba. No se pudo probar la edición con una cuenta real porque aún no existen usuarios. Tampoco se verificaron los ajustes alojados de registro y confirmación.

Los datos de contacto iniciales son ejemplos: cambia WhatsApp, Instagram, correo y teléfono en `src/lib/site.ts` antes de publicar. Confirma también las especificaciones iniciales (tamaños, plazos, resolución) con la empresa.

## Subir a GitHub
Crea un repositorio vacío en GitHub, preferentemente privado, sin README inicial. Dentro de la carpeta descomprimida:

```sh
git init
git add .
git commit -m "Capa3D con catálogo por categorías"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/capa3d.git
git push -u origin main
```
Sustituye `TU_USUARIO` y el nombre del repositorio. El `.gitignore` del ZIP excluye `.env`, dependencias y archivos generados. Nunca subas exportaciones de cuentas/clientes o claves privadas.

Para sincronización automática desde Lovable usa **Project settings → Git → GitHub**: crea un repositorio nuevo, no conecta uno ya existente.

## Publicar en Vercel
1. **Add New → Project** e importa el repositorio.
2. **Framework Preset: Other**. Root Directory: donde está `package.json` (elige `capa3d` si subiste esa carpeta completa).
3. **Build Command: npm run build**. Conserva Output Directory automático, no fuerces `dist`: la aplicación necesita su servidor.
4. Usa Node.js 22 si puedes seleccionar la versión.
5. Copia desde `.env` a **Environment Variables**, para Production y los entornos que uses:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_PROJECT_ID`
6. **Deploy**. `vite.config.ts` detecta `VERCEL` y genera la salida para Vercel. No requiere una clave privada de base de datos.
7. En la configuración de autenticación de Lovable Cloud autoriza el dominio de Vercel y las direcciones de confirmación usadas por la web (actualmente `/admin`). Revísalo nuevamente si cambias de dominio. No se verificó esta configuración alojada ni un despliegue real en Vercel en esta entrega.
8. Prueba ingreso con tu cuenta, guardar un producto y volver a verlo, fotos y categorías. Cambiar variables exige un nuevo despliegue.

## Dónde viven la base de datos y las imágenes
| Parte | Alojamiento actual | Contenido |
| --- | --- | --- |
| Web | Vista previa de Lovable; Vercel cuando la publiques allí | Páginas y código |
| Base de datos | Lovable Cloud, PostgreSQL administrado | Productos, inventario, galería, solicitudes, permisos |
| Cuentas | Autenticación de Lovable Cloud | Administradores |
| Fotos subidas | Almacenamiento de Lovable Cloud, contenedor privado `images` | Catálogo y galería |
| Imágenes del diseño | `src/assets`, incluidas en el código | Imagen principal y respaldos de categorías |

Vercel aloja la web; **no migra la base de datos, las cuentas ni las fotos**. La conexión actual está en `.env`. Las fotos se guardan por ruta `image_path`; el sitio crea enlaces firmados válidos por siete días. No uses esos enlaces temporales como referencias permanentes para una migración.

## Migrar después con otra IA
**Este ZIP contiene código, no una copia completa de datos, cuentas o fotos subidas.**

1. En Lovable abre **More → Database → Manage → Settings → Export project data → Export data**. En la tarjeta **Database** pulsa **Export → Start export**. Descarga desde el enlace enviado por correo o desde **More → Storage**. El backend debe estar activo. Límites: una exportación cada 24 horas, base de hasta 15 GB y archivo de hasta 5 GB.
2. Ese export contiene estructura, datos y cuentas con hashes de contraseña. Es confidencial: no lo subas a GitHub ni a un chat público. Usa herramientas seguras del destino para importarlo.
3. Descarga por separado las fotos desde **More → Storage**, contenedor `images`. Ni el export ni las copias diarias de base de datos incluyen esos archivos.
4. Mantén rutas como `products/...`, `gallery/...` y `seed/...` al copiarlas al destino; si las cambias, actualiza cada `image_path`.
5. Comparte este código y README con la otra IA. Las migraciones en `drizzle/migrations` documentan la estructura, pero no sustituyen el export con datos actuales y cuentas.
6. Configura en el nuevo proveedor permisos, autenticación, claves y URLs autorizadas. Los secretos y ajustes de proveedores no vienen en el export. Lovable Cloud no proporciona contraseña de base de datos ni clave privada de servicio para una migración manual.
7. Puntos a adaptar: `src/lib/data.ts` (consultas, fotos y subidas), `src/lib/catalog.ts` (categorías y filtros), formularios y panel en `src/routes`, y clientes generados en `src/integrations/supabase`. Si el nuevo servicio no es compatible, no basta con cambiar la URL: hay que reemplazar consultas, autenticación y almacenamiento de forma coherente.
8. Comprueba en el destino: ingreso con cuenta real, permisos, crear/editar/ocultar productos y leerlos de nuevo, tags, fotos, inventario y solicitudes. Conserva Lovable Cloud activo hasta completar las pruebas y coordina los últimos cambios para no perder datos durante el traslado.

No se migró nada en esta entrega. Tecnología del sitio: TanStack Start, React, TypeScript y Tailwind. Conserva su configuración de servidor al alojarlo fuera de Lovable.
