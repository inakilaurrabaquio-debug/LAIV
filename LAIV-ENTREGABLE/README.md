# Grupo LAIV — Entregable académico

Sitio demostrativo desarrollado con HTML, CSS y JavaScript.

## Estructura
- `index.html`: inicio
- `historia.html`: nosotros
- `movimientos.html`: registro de ingresos y gastos
- `inventarios.html`: control demostrativo de inventario
- `reportes.html`: indicadores y reportes
- `login.html`: formulario de acceso demostrativo
- `css/styles.css`: estilos responsivos
- `js/`: lógica de movimientos, inventarios, reportes y acceso
- `assets/images/`: fotografías locales

## Publicación
Este proyecto es un sitio estático. No necesita Jekyll ni Ruby.
Se recomienda publicar mediante GitHub Actions con `actions/upload-pages-artifact` y `actions/deploy-pages`.

## Datos demostrativos
Los movimientos de ejemplo se inicializan en el navegador con localStorage cuando no existe información guardada.
Los datos son ilustrativos y se almacenan localmente en el navegador; no existe una base de datos compartida entre visitantes.
