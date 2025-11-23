# 🧪 Guía de Pruebas - Barra de Búsqueda

## 🚀 Cómo Probar la Funcionalidad

### Paso 1: Iniciar el Servidor
```bash
npm run dev
```

### Paso 2: Abrir las Herramientas de Desarrollador

1. **Presiona F12** o **Ctrl+Shift+I** (Windows/Linux) o **Cmd+Option+I** (Mac)
2. Ve a la pestaña **Console**

### Paso 3: Verificar que la Búsqueda Funciona

#### ✅ Test 1: Verificar Inicialización
Al cargar la página, deberías ver en la consola que los componentes se han inicializado correctamente.

#### ✅ Test 2: Escribir en la Barra de Búsqueda
1. Haz clic en el campo de búsqueda
2. Escribe **"be"** (al menos 2 caracteres)
3. **Verifica en la consola:**
   ```
   👀 SearchView: Input detectado: be
   🔍 SearchModel: setQuery llamado con: be
   ⏱️ SearchModel: Iniciando búsqueda con debounce...
   ```

#### ✅ Test 3: Ver Resultados
Después de 300ms (debounce), deberías ver:
```
🔎 SearchModel: Buscando: be
✅ SearchModel: Resultados encontrados: X
🎨 SearchView: Renderizando con estado: {...}
📋 SearchView: Mostrando X resultados
```

Y una **tabla con los resultados** en la consola.

#### ✅ Test 4: Ver el Dropdown Visual
Mientras escribes, deberías ver aparecer un **dropdown blanco debajo de la barra de búsqueda** con:
- Títulos de categorías (Artistas, Canciones, Álbumes, Productos)
- Los resultados correspondientes
- Iconos y detalles de cada resultado

#### ✅ Test 5: Hacer Clic en un Resultado
1. Haz clic en cualquier resultado del dropdown
2. Deberías ver un **alert** con la navegación
3. El dropdown se cierra automáticamente
4. El input se limpia

### Palabras Clave para Probar

Prueba estas búsquedas para obtener diferentes resultados:

| Búsqueda | Resultados Esperados |
|----------|---------------------|
| `beatles` | Artista: The Beatles, Álbumes y Productos relacionados |
| `pink` | Artista: Pink Floyd, Álbumes |
| `queen` | Canción: Bohemian Rhapsody |
| `abbey` | Álbum: Abbey Road, Productos relacionados |
| `vinilo` | Productos en formato vinilo |
| `cd` | Productos en formato CD |
| `dark` | Álbum: Dark Side of the Moon |
| `hotel` | Canción: Hotel California |
| `zeppelin` | Canción: Stairway to Heaven |
| `radio` | Artista: Radiohead, Álbum: OK Computer |

### 🔍 Verificación Visual

#### Deberías Ver:
1. ✅ **Spinner de carga** (brevemente, durante 400ms)
2. ✅ **Resultados agrupados** por tipo
3. ✅ **Iconos** diferentes para cada categoría:
   - 👤 Artistas
   - 🎵 Canciones
   - 💿 Álbumes
   - 🛍️ Productos
4. ✅ **Hover effect** al pasar el mouse sobre resultados
5. ✅ **Animación suave** al aparecer el dropdown

#### No Deberías Ver Errores:
- ❌ Errores en la consola
- ❌ Elementos mal posicionados
- ❌ Dropdown que no aparece
- ❌ Resultados que no coinciden con la búsqueda

### 📊 Inspeccionar el Estado en la Consola

Puedes inspeccionar el estado actual del modelo directamente:

```javascript
// En la consola del navegador:
// (después de que la página cargue)
```

### 🐛 Solución de Problemas

#### Problema: No aparece nada al escribir
**Solución:**
1. Verifica que escribes **al menos 2 caracteres**
2. Abre la consola y busca mensajes de error
3. Verifica que el archivo `main.js` inicializa correctamente:
   ```javascript
   const searchInput = document.querySelector('input[type="search"]')
   const searchButton = document.querySelector('button[type="submit"]')
   ```

#### Problema: No veo los logs en la consola
**Solución:**
1. Asegúrate de que estás en la pestaña **Console**
2. Verifica que no hay filtros activos en la consola
3. Recarga la página (F5 o Ctrl+R)

#### Problema: El dropdown aparece en el lugar equivocado
**Solución:**
1. Verifica que el formulario tiene `position: relative`
2. Inspecciona el elemento con las DevTools (click derecho > Inspeccionar)
3. Ajusta los estilos en `style.css` si es necesario

#### Problema: Los resultados no se filtran correctamente
**Solución:**
1. Verifica en la consola los resultados retornados por `mockApiSearch`
2. Usa `console.table(results)` para ver los datos en formato tabla
3. Verifica que la búsqueda es case-insensitive (toLowerCase)

### 🎯 Checklist de Funcionalidad

Marca cada item cuando lo verifiques:

- [ ] La búsqueda se activa después de escribir 2+ caracteres
- [ ] Hay un delay de 300ms (debounce) antes de buscar
- [ ] Aparece el spinner de "Cargando..."
- [ ] Los resultados se muestran agrupados por categoría
- [ ] Se pueden ver artistas, canciones, álbumes y productos
- [ ] El hover sobre resultados cambia el fondo
- [ ] Hacer clic en un resultado muestra un alert
- [ ] El dropdown se cierra al hacer clic fuera
- [ ] El dropdown se cierra al seleccionar un resultado
- [ ] Buscar con 1 carácter o menos no muestra resultados
- [ ] Buscar sin coincidencias muestra "Sin resultados"
- [ ] Los logs aparecen correctamente en la consola
- [ ] No hay errores en la consola

### 📸 Capturas de Referencia

**Estado de Carga:**
```
Buscando...
(con spinner)
```

**Con Resultados:**
```
ARTISTAS
🎤 The Beatles
   50M seguidores

CANCIONES
🎵 Bohemian Rhapsody
   Queen • 5:55

ÁLBUMES
💿 Abbey Road
   The Beatles • 1969

PRODUCTOS
🛍️ Abbey Road - Vinilo
   29.99€
```

**Sin Resultados:**
```
🔍 No se encontraron resultados para "xyz"
```

### 🔧 Modo Debug Avanzado

Para ver información más detallada, puedes añadir breakpoints:

1. Ve a la pestaña **Sources** en las DevTools
2. Navega a `src/models/SearchModel.js`
3. Añade breakpoints en:
   - Línea `setQuery` (cuando se escribe)
   - Línea `search` (cuando se busca)
   - Línea donde se resuelve `mockApiSearch`

### ✨ Próximos Pasos

Una vez verificado que funciona:
1. **Quitar los logs de debug** (console.log)
2. **Conectar con el backend real**
3. **Implementar navegación real** (sin alerts)
4. **Añadir tests unitarios**

---

**¿Todo funciona?** ¡Genial! La barra de búsqueda está lista para ser integrada con el backend.

**¿Algo no funciona?** Revisa la sección de solución de problemas o consulta los logs en la consola.
