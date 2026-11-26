# API y rutas del frontend

## API REST

Todas las rutas empiezan con `http://localhost:3000/api`.

| Método                 | Ruta                             | Acceso        | Qué hace                                                                                                                                         |
| ---------------------- | -------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST                   | `/auth/registro`                 | Público       | Crea una cuenta de cliente                                                                                                                       |
| POST                   | `/auth/login`                    | Público       | Valida las credenciales, guarda la sesión en la cookie `nodopc_sesion` y devuelve el usuario                                                     |
| GET                    | `/auth/yo`                       | Con sesión    | Devuelve el usuario de la sesión actual                                                                                                          |
| POST                   | `/auth/salir`                    | Público       | Borra la cookie de sesión                                                                                                                        |
| GET                    | `/salud`                         | Público       | Confirma que la API y la base de datos responden                                                                                                 |
| GET                    | `/categorias`, `/categorias/:id` | Público       | Lista o devuelve una categoría                                                                                                                   |
| POST, PUT, DELETE      | `/categorias`, `/categorias/:id` | Admin         | Crea, edita o elimina                                                                                                                            |
| GET                    | `/marcas`, `/marcas/:id`         | Público       | Lista o devuelve una marca                                                                                                                       |
| POST, PUT, DELETE      | `/marcas`, `/marcas/:id`         | Admin         | Crea, edita o elimina                                                                                                                            |
| GET                    | `/productos`, `/productos/:id`   | Público       | Lista (con filtros `categoria`, `marca` y `buscar`) o devuelve un producto                                                                       |
| GET                    | `/productos/mas-vendidos`        | Público       | Los 3 productos con más unidades vendidas (para la portada)                                                                                      |
| POST, PUT, DELETE      | `/productos`, `/productos/:id`   | Admin         | Crea, edita o elimina                                                                                                                            |
| GET, POST, PUT, DELETE | `/usuarios`, `/usuarios/:id`     | Admin         | Gestión completa de usuarios                                                                                                                     |
| GET                    | `/pedidos/mios`                  | Con sesión    | Pedidos del usuario logueado                                                                                                                     |
| GET                    | `/pedidos`                       | Admin         | Todos los pedidos                                                                                                                                |
| GET                    | `/pedidos/:id`                   | Dueño o admin | Un pedido con sus productos                                                                                                                      |
| POST                   | `/pedidos`                       | Con sesión    | Crea un pedido y descuenta el stock                                                                                                              |
| PUT                    | `/pedidos/:id`                   | Admin         | Cambia el estado o la dirección                                                                                                                  |
| DELETE                 | `/pedidos/:id`                   | Dueño o admin | Elimina un pedido pendiente y devuelve el stock                                                                                                  |
| GET                    | `/dashboard`                     | Admin         | Métricas: totales, ventas por mes, productos más vendidos, ventas por categoría, pedidos por estado, mejores clientes y productos con poco stock |

Códigos de respuesta que usa la API: `200` correcto, `201` creado, `400` datos inválidos, `401` sin sesión o sesión inválida, `403` sin permiso, `404` no existe, `409` conflicto (dato repetido, registro en uso o sin stock), `429` demasiados intentos y `500` error inesperado.

La sesión viaja en una cookie `httpOnly`. Para probar la API con Thunder Client o Postman, primero hacé el login: el programa guarda la cookie y la manda sola en los pedidos siguientes.

## Vistas del frontend

### Panel del administrador (listado, alta y edición de cada tabla)

| Tabla        | Listado             | Creación                  | Edición                        |
| ------------ | ------------------- | ------------------------- | ------------------------------ |
| `productos`  | `/admin/productos`  | `/admin/productos/nuevo`  | `/admin/productos/:id/editar`  |
| `categorias` | `/admin/categorias` | `/admin/categorias/nueva` | `/admin/categorias/:id/editar` |
| `marcas`     | `/admin/marcas`     | `/admin/marcas/nueva`     | `/admin/marcas/:id/editar`     |
| `usuarios`   | `/admin/usuarios`   | `/admin/usuarios/nuevo`   | `/admin/usuarios/:id/editar`   |
| `pedidos`    | `/admin/pedidos`    | `/checkout`               | `/admin/pedidos/:id/editar`    |

La eliminación se hace desde cada listado, con una confirmación dentro de la misma fila.

### Resto de las vistas

| Ruta                                             | Vista                                                                     | Acceso                     |
| ------------------------------------------------ | ------------------------------------------------------------------------- | -------------------------- |
| `/`                                              | Inicio                                                                    | Público                    |
| `/catalogo` y `/catalogo/categoria/:categoriaId` | Catálogo con filtros (acepta `?buscar=` desde el buscador del encabezado) | Público                    |
| `/producto/:id`                                  | Detalle de un producto                                                    | Público                    |
| `/carrito`                                       | Carrito                                                                   | Público                    |
| `/login` y `/registro`                           | Inicio de sesión y registro                                               | Solo sin sesión            |
| `/dashboard`                                     | Panel principal (distinto según el rol)                                   | Con sesión                 |
| `/mis-pedidos`                                   | Listado de los pedidos propios                                            | Con sesión                 |
| `/pedidos/:id`                                   | Detalle de un pedido                                                      | Con sesión (dueño o admin) |
