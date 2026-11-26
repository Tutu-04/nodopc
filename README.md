# NodoPC — Tienda de hardware

Proyecto final de Programación. Aplicación web full stack con **React + Express + MySQL**.

NodoPC es una tienda online de componentes de PC, PC armadas, monitores y periféricos. Los visitantes pueden recorrer el catálogo y armar un carrito, los clientes registrados pueden comprar y seguir sus pedidos, y los administradores gestionan todo el contenido de la tienda.

## Autor

Gonzalo Romeo Lazarte

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | React, Vite, react-router-dom, Zustand, Axios, Tailwind CSS, Recharts |
| Backend | Node.js, Express, mysql2, bcrypt, jsonwebtoken, cors, dotenv |
| Base de datos | MySQL |

## Qué puede hacer cada rol

| Rol | Puede |
|---|---|
| **Visitante** (sin sesión) | Ver el inicio, el catálogo con filtros y el detalle de cada producto. Armar un carrito. Registrarse e iniciar sesión. |
| **Cliente** | Todo lo anterior, más: ver su panel, confirmar compras, ver sus pedidos y cancelar los que estén pendientes. |
| **Administrador** | Todo lo anterior, más: ver el panel con los números de la tienda y crear, editar y eliminar productos, categorías, marcas, usuarios y pedidos. |

## Instalación y ejecución

La guía paso a paso, con los programas a instalar y la solución a los errores más comunes, está en [GUIA_DE_INSTALACION.md](GUIA_DE_INSTALACION.md).

Resumen, con Node.js y MySQL ya instalados y MySQL encendido:

1. En `backend`, copiá `.env.example` como `.env` y completá los datos de tu MySQL.
2. Desde la carpeta principal `tienda-hardware`, ejecutá:

```bash
npm run instalar      # instala las dependencias de backend y frontend
npm run crear-base    # crea la base tienda_hardware con los datos de prueba
```

3. Arrancá cada parte en su propia terminal:

```bash
npm run backend       # terminal 1: API en http://localhost:3000
npm run frontend      # terminal 2: página en http://localhost:5173
```

## Usuarios de prueba

Son cuentas de demostración que carga el script SQL. En la base se guarda solo el hash de cada contraseña.

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@nodopc.com` | `admin123` |
| Cliente | `cliente@nodopc.com` | `cliente123` |
| Cliente | `maria@nodopc.com` | `cliente123` |

También hay otros 4 clientes con pedidos (`lucas@`, `sofia@`, `julian@` y `valentina@nodopc.com`, todos con `cliente123`), para que el panel de métricas tenga datos de varios meses.

## Estructura del proyecto

```
tienda-hardware/
├── package.json               Atajos: instalar, crear-base, backend y frontend
├── GUIA_DE_INSTALACION.md     Guía paso a paso para hacerlo funcionar
├── database/
│   └── tienda_hardware.sql    Script que crea la base, las tablas y los datos de prueba
├── docs/
│   └── diagrama-er.png        Diagrama entidad-relación
├── backend/
│   ├── .env.example           Ejemplo de configuración (sin credenciales reales)
│   └── src/
│       ├── index.js           Arranque de Express, middlewares y rutas
│       ├── db.js              Conexión a MySQL
│       ├── crearBase.js       Script de npm run crear-base
│       ├── routes/            Qué URL y qué método HTTP llama a cada función
│       ├── controllers/       Validan los datos y arman la respuesta
│       ├── models/            Consultas SQL (acceso a datos)
│       ├── middlewares/       Token, rol y manejo de errores
│       └── utils/             Validaciones y mensajes de error de MySQL
└── frontend/
    └── src/
        ├── App.jsx            Mapa de rutas de la aplicación
        ├── api/               Cliente Axios (agrega el token a cada pedido)
        ├── store/             Estado global con Zustand (sesión y carrito)
        ├── components/        Menú, protección de rutas, íconos y piezas reutilizables
        ├── pages/             Una vista por archivo
        ├── utils/             Formato de precios y fechas, colores de los gráficos
        └── index.css          Estilos comunes del diseño (botones, tarjetas, tablas, campos)
```

## Base de datos

![Diagrama entidad-relación](docs/diagrama-er.png)

| Tabla | Guarda | Se relaciona con |
|---|---|---|
| `usuarios` | Cuentas, con su rol y el hash de la contraseña | Un usuario tiene muchos pedidos |
| `categorias` | Tipos de producto | Una categoría tiene muchos productos |
| `marcas` | Fabricantes | Una marca tiene muchos productos |
| `productos` | Lo que vende la tienda, con precio y stock | Pertenece a una categoría y a una marca |
| `pedidos` | Cada compra, con su estado y total | Pertenece a un usuario |
| `detalle_pedido` | Qué productos y cuántos tiene cada pedido, con el nombre y el precio del momento de la compra | Une pedidos con productos |

## Vistas del frontend

### Vistas de gestión (3 por tabla)

| Tabla | Listado | Creación | Edición |
|---|---|---|---|
| `productos` | `/admin/productos` | `/admin/productos/nuevo` | `/admin/productos/:id/editar` |
| `categorias` | `/admin/categorias` | `/admin/categorias/nueva` | `/admin/categorias/:id/editar` |
| `marcas` | `/admin/marcas` | `/admin/marcas/nueva` | `/admin/marcas/:id/editar` |
| `usuarios` | `/admin/usuarios` | `/admin/usuarios/nuevo` | `/admin/usuarios/:id/editar` |
| `pedidos` | `/admin/pedidos` | `/checkout` | `/admin/pedidos/:id/editar` |

La eliminación se hace desde cada listado, con un cartel de confirmación.

### Resto de las vistas

| Ruta | Vista | Acceso |
|---|---|---|
| `/` | Inicio | Público |
| `/catalogo` y `/catalogo/categoria/:categoriaId` | Catálogo con filtros (acepta `?buscar=` desde el buscador del encabezado) | Público |
| `/producto/:id` | Detalle de un producto | Público |
| `/carrito` | Carrito | Público |
| `/login` y `/registro` | Inicio de sesión y registro | Solo sin sesión |
| `/dashboard` | Panel principal (distinto según el rol) | Con sesión |
| `/mis-pedidos` | Listado de los pedidos propios | Con sesión |
| `/pedidos/:id` | Detalle de un pedido | Con sesión (dueño o admin) |

## API

Todas las rutas empiezan con `http://localhost:3000/api`.

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/auth/registro` | Público | Crea una cuenta de cliente |
| POST | `/auth/login` | Público | Valida las credenciales y devuelve un token JWT |
| GET | `/categorias`, `/categorias/:id` | Público | Lista o devuelve una categoría |
| POST, PUT, DELETE | `/categorias`, `/categorias/:id` | Admin | Crea, edita o elimina |
| GET | `/marcas`, `/marcas/:id` | Público | Lista o devuelve una marca |
| POST, PUT, DELETE | `/marcas`, `/marcas/:id` | Admin | Crea, edita o elimina |
| GET | `/productos`, `/productos/:id` | Público | Lista (con filtros `categoria`, `marca` y `buscar`) o devuelve un producto |
| GET | `/productos/mas-vendidos` | Público | Los 3 productos con más unidades vendidas (para la portada) |
| POST, PUT, DELETE | `/productos`, `/productos/:id` | Admin | Crea, edita o elimina |
| GET, POST, PUT, DELETE | `/usuarios`, `/usuarios/:id` | Admin | Gestión completa de usuarios |
| GET | `/pedidos/mios` | Con sesión | Pedidos del usuario logueado |
| GET | `/pedidos` | Admin | Todos los pedidos |
| GET | `/pedidos/:id` | Dueño o admin | Un pedido con sus productos |
| POST | `/pedidos` | Con sesión | Crea un pedido y descuenta el stock |
| PUT | `/pedidos/:id` | Admin | Cambia el estado o la dirección |
| DELETE | `/pedidos/:id` | Dueño o admin | Elimina un pedido pendiente y devuelve el stock |
| GET | `/dashboard` | Admin | Métricas: totales, ventas por mes, productos más vendidos, ventas por categoría, pedidos por estado, mejores clientes y productos con poco stock |

Códigos de respuesta que usa la API: `200` correcto, `201` creado, `400` datos inválidos, `401` sin sesión o token inválido, `403` sin permiso, `404` no existe, `409` conflicto (dato repetido, registro en uso o sin stock) y `500` error inesperado.

## Seguridad: bcrypt y JWT

### Dónde está en el código

| Qué | Archivo | Cómo |
|---|---|---|
| Hashear la contraseña al registrarse | `backend/src/controllers/auth.controller.js` → `registrar` | `bcrypt.hash(password, 10)` |
| Hashear al crear o editar un usuario desde el admin | `backend/src/controllers/usuarios.controller.js` | `bcrypt.hash(password, 10)` |
| Comprobar la contraseña en el login | `backend/src/controllers/auth.controller.js` → `iniciarSesion` | `bcrypt.compare(password, hashGuardado)` |
| Crear el token en el login | `backend/src/controllers/auth.controller.js` → `iniciarSesion` | `jwt.sign({ id, nombre, rol }, JWT_SECRET, { expiresIn: '8h' })` |
| Verificar el token en cada ruta privada | `backend/src/middlewares/auth.js` → `verificarToken` | `jwt.verify(token, JWT_SECRET)`; si falla, responde 401 |
| Verificar el rol | `backend/src/middlewares/auth.js` → `soloAdmin` | Si el rol no es `admin`, responde 403 |
| Mandar el token en cada pedido | `frontend/src/api/api.js` | Interceptor de Axios que agrega `Authorization: Bearer <token>` |
| Cerrar la sesión si el token venció | `frontend/src/api/api.js` | Si la API responde 401, borra la sesión y `RutaProtegida` manda al login |

### Cómo demostrarlo en la defensa

**1. Las contraseñas están hasheadas.**

1. En MySQL Workbench, ejecutá:

   ```sql
   SELECT id, email, password FROM tienda_hardware.usuarios;
   ```

2. Ninguna contraseña se ve. Cada una es un hash que empieza con `$2b$10$`:
   - `$2b$` es el algoritmo bcrypt.
   - `10` es el costo: cuántas vueltas hace bcrypt para calcular el hash.
   - Los 22 caracteres siguientes son la **sal**: un valor al azar distinto para cada usuario.
   - El resto es el hash propiamente dicho.
3. Todos los clientes de prueba tienen la misma contraseña (`cliente123`), pero sus hashes son distintos. Eso es la sal en acción.
4. Registrá una cuenta nueva desde la página y volvé a ejecutar la consulta: aparece con su propio hash.

**2. El login devuelve un JWT y se manda en cada pedido.**

1. Iniciá sesión en la página y apretá `F12` para abrir las herramientas del navegador.
2. Pestaña **Application** → **Local Storage** → `http://localhost:5173` → clave `nodopc-sesion`. Ahí está el `token`: tres partes separadas por puntos (encabezado, datos y firma).
3. Pestaña **Network** → entrá a *Mis pedidos* → clic en el pedido `mios` → **Headers**. En `Authorization` se ve `Bearer eyJ...`.
4. *(Opcional)* Si pegás el token en <https://jwt.io>, se leen los datos que lleva: `id`, `nombre`, `rol` y el vencimiento. La contraseña no viaja en el token.

**3. El backend no se deja engañar.**

- **Cambiar el rol a mano:**
  1. Ingresá como cliente.
  2. En **Local Storage**, editá `nodopc-sesion` y cambiá `"rol":"cliente"` por `"rol":"admin"`.
  3. Recargá la página. El menú muestra "Administración", porque el frontend confía en lo que tiene guardado.
  4. Entrá a *Usuarios*: la tabla queda vacía y aparece "No tenés permiso para hacer esto". El backend lee el rol desde el token firmado, no desde el navegador.
- **Alterar el token:**
  1. Borrá o cambiá cualquier letra del final del token en Local Storage.
  2. Recargá *Mis pedidos*. La firma ya no coincide, la API responde 401 y la página cierra la sesión y te manda al login.

## Decisiones principales de implementación

- **Backend en capas.** Las rutas solo dicen qué función atiende cada URL, los controladores validan y responden, y los modelos son los únicos que escriben SQL.
- **Consultas parametrizadas.** Todos los valores viajan como parámetros (`?`), nunca pegados dentro del texto de la consulta. Eso evita la inyección SQL.
- **Contraseñas con bcrypt.** En la base se guarda el hash. Al iniciar sesión se compara la contraseña ingresada contra ese hash.
- **Sesión con JWT.** El login devuelve un token firmado que dura 8 horas. El frontend lo manda en la cabecera `Authorization` de cada pedido.
- **Protección doble.** El frontend oculta y redirige las rutas privadas (`RutaProtegida`), y el backend vuelve a verificar el token y el rol en cada endpoint (`verificarToken` y `soloAdmin`).
- **El precio lo pone el servidor.** Al comprar, el frontend manda solo el id y la cantidad de cada producto. El backend lee el precio y el stock de la base.
- **Transacciones en los pedidos.** Crear un pedido toca tres tablas. Si algo falla en el medio, se deshace todo.
- **Historial de pedidos intacto.** `detalle_pedido` guarda el nombre y el precio del producto en el momento de la compra. Así, si después el producto cambia de precio o se elimina, los pedidos viejos no se alteran.
- **Borrados.** Un producto se puede eliminar aunque figure en pedidos: se borra de la base y su renglón en el pedido queda con el nombre guardado (`ON DELETE SET NULL`). Una categoría, una marca o un usuario que están en uso no se pueden borrar, y la API explica por qué. Los pedidos solo se eliminan mientras están pendientes, y al hacerlo se devuelve el stock. La confirmación se hace dentro de la misma fila, sin el cartel del navegador.
- **Buscador.** Busca cada palabra por separado en el nombre, la descripción, la marca y la categoría. En el frontend, un `useEffect` con `setTimeout` espera a que el usuario deje de escribir antes de consultar la API, y otro descarta las respuestas viejas si llegan fuera de orden.
- **Métricas con Recharts.** El panel del administrador usa barras (ventas por mes, productos más vendidos, mejores clientes), una dona (ventas por categoría, con las más chicas agrupadas en "Otras") y una torta (pedidos por estado). Cada gráfico tiene su tabla con los números exactos. Los componentes reutilizables son `GraficoBarras` y `GraficoTorta`, y los colores están en `frontend/src/utils/colores.js`.
- **Diseño.** Tailwind con una paleta corta: negro para el texto y los botones, naranja para lo importante (comprar, confirmar, guardar) y tarjetas blancas sobre fondo gris claro. Las clases que se repiten (`btn`, `tarjeta`, `campo`, `tabla`, `insignia`) están definidas una sola vez en `frontend/src/index.css`. La tipografía es Inter, de Google Fonts; sin internet se usa la fuente del sistema y todo sigue funcionando.
- **Íconos sin librerías.** `Icono` dibuja los íconos de la interfaz con SVG, e `IconoCategoria` elige el dibujo según el nombre de la categoría. Si un producto no tiene foto, o la dirección de la foto está rota, `ImagenProducto` muestra el ícono de su categoría.
- **Imágenes de productos.** El campo acepta una dirección completa (`https://...`) o una ruta dentro del proyecto, por ejemplo `/productos/1.jpg` para un archivo guardado en `frontend/public/productos/`.
- **Portada.** Muestra los 3 más vendidos (`GET /productos/mas-vendidos`, calculado con `SUM` sobre `detalle_pedido`), las categorías y los últimos productos. El buscador del encabezado lleva al catálogo con `?buscar=`, y el catálogo lee ese parámetro con `useSearchParams`.
- **Estado global con Zustand.** La sesión y el carrito se comparten entre componentes y se guardan en el navegador para que no se pierdan al recargar.

## Problemas frecuentes

| Qué pasa | Qué revisar |
|---|---|
| El backend muestra "No se pudo conectar a MySQL" | El mensaje de abajo dice la causa. Ver la sección 8 de la guía de instalación |
| La página muestra "No se pudo conectar con el servidor" | Que el backend esté corriendo en otra terminal |
| El backend dice que el puerto 3000 está en uso | Cerrá el otro programa que lo usa, o cambiá `PORT` en `.env` y la dirección en `frontend/src/api/api.js` |
| Los acentos se ven mal | Volvé a ejecutar `npm run crear-base` |
