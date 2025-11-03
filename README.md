# Estructura MVC (Frontend)

Este proyecto usa Vite y organiza el código del frontend con el patrón MVC (Model–View–Controller):

- `src/models/`: estado y lógica de dominio (no tocan el DOM). Emiten eventos cuando cambian.
- `src/views/`: renderizan la UI y emiten eventos de interacción (clicks, submits).
- `src/controllers/`: conectan modelo y vista. Escuchan eventos de la vista y actualizan el modelo; cuando el modelo cambia, fuerzan re-render.
- `src/core/`: utilidades compartidas (p. ej. `EventEmitter`).

## Archivos de ejemplo

- `src/models/ExampleModel.js`: lista de elementos con `addItem` y `removeAt`.
- `src/views/ExampleView.js`: formulario + lista con Bootstrap; emite `add` y `removeAt`.
- `src/controllers/ExampleController.js`: cableado entre vista y modelo.
- `src/main.js`: punto de entrada que monta el ejemplo sobre `#app` en `index.html`.

## Cómo ejecutar

```powershell
npm install
npm run dev
```

Abre la URL local que indique Vite (por defecto http://localhost:5173) y prueba el formulario para ver el flujo MVC.

## Convenciones

- Los modelos NO importan vistas ni tocan el DOM.
- Las vistas NO modifican el estado por sí solas; sólo emiten eventos.
- Los controladores son finos: orquestan y mantienen el acoplamiento bajo.

## Siguientes pasos

- Crear modelos/vistas/controladores reales de la app (ej. catálogo, carrito, auth).
- Añadir tests unitarios para modelos (p. ej. con Vitest) y pruebas de vistas con Testing Library.
- Considerar un router (p. ej. `vanilla-router` o `tiny-router`) si se necesitan múltiples pantallas.
