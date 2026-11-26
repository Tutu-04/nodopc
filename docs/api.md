# API y rutas del frontend

## API REST

Todas las rutas empiezan con `http://localhost:3000/api`.

| Método                 | Ruta                             | Acceso        | Qué hace                                                                                                                                     |
| ---------------------- | -------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| POST                   | `/auth/registro`                 | Público       | Crea una cuenta de cliente                                                                                                                   |
| POST                   | `/auth/login`                    | Público       | Valida las credenciales, guarda la sesión en la cookie `nodopc_sesion` y devuelve el usuario                                                 |
| GET                    | `/auth/yo`                       | Con sesión    | Devuelve el usuario de la sesión actual                                                                                                      |
| POST                   | `/auth/salir`                    | Público       | Borra la cookie de sesión                                                                                                                    |
| POST                   | `/auth/olvide-password`          | Público       | Manda por correo un enlace para elegir una contraseña nueva. Responde lo mismo exista o no la cuenta                                         |
| POST                   | `/auth/restablecer-password`     | Público       | Recibe `{ token, password }`, cambia la contraseña y anula los demás enlaces de la cuenta                                                    |
| GET                    | `/salud`                         | Público       | Confirma que la API y la base de datos responden                                                                                             |
| GET                    | `/categorias`, `/categorias/:id` | Público       | Lista o devuelve una categoría                                                                                                               |
| POST, PUT, DELETE      | `/categorias`, `/categorias/:id` | Admin         | Crea, edita o elimina                                                                                                                        |
| GET                    | `/marcas`, `/marcas/:id`         | Público       | Lista o devuelve una marca                                                                                                                   |
| POST, PUT, DELETE      | `/marcas`, `/marcas/:id`         | Admin         | Crea, edita o elimina                                                                                                                        |
| GET                    | `/productos`                     | Público       | Lista paginada con filtros (ver abajo)                                                                                                       |
| GET                    | `/productos/:id`                 | Público       | Devuelve un producto                                                                                                                         |
| GET                    | `/productos/mas-vendidos`        | Público       | Los 3 productos con más unidades vendidas (para la portada)                                                                                  |
| POST, PUT, DELETE      | `/productos`, `/productos/:id`   | Admin         | Crea, edita o elimina                                                                                                                        |
| POST                   | `/productos/:id/imagen`          | Admin         | Sube la imagen del producto (campo `imagen`, JPG, PNG o WebP de hasta 2 MB) y borra la anterior                                              |
| DELETE                 | `/productos/:id/imagen`          | Admin         | Quita la imagen y borra el archivo                                                                                                           |
| GET, POST, PUT, DELETE | `/usuarios`, `/usuarios/:id`     | Admin         | Gestión completa de usuarios                                                                                                                 |
| PUT                    | `/cuenta`                        | Con sesión    | Cambia el nombre y el email propios, y renueva la cookie                                                                                     |
| PUT                    | `/cuenta/password`               | Con sesión    | Cambia la contraseña propia; pide la actual                                                                                                  |
| GET                    | `/pedidos/mios`                  | Con sesión    | Pedidos del usuario logueado                                                                                                                 |
| GET                    | `/pedidos`                       | Admin         | Todos los pedidos                                                                                                                            |
| GET                    | `/pedidos/:id`                   | Dueño o admin | Un pedido con sus productos y `estados_siguientes`                                                                                           |
| POST                   | `/pedidos`                       | Con sesión    | Crea un pedido pendiente de pago, calcula el envío y reserva el stock (ver abajo)                                                            |
| POST                   | `/pedidos/:id/cancelar`          | Dueño o admin | Cancela el pedido y devuelve el stock. El dueño solo puede cancelar uno pendiente; el admin, también uno pagado                              |
| PUT                    | `/pedidos/:id`                   | Admin         | Pasa el pedido al estado siguiente o corrige la dirección de un envío que no salió                                                           |
| DELETE                 | `/pedidos/:id`                   | Admin         | Elimina un pedido cancelado                                                                                                                  |
| GET                    | `/envios`                        | Público       | Provincias con su costo de envío, el mínimo para el envío gratis y los minutos para pagar                                                    |
| GET                    | `/pagos/medios`                  | Público       | Qué medios de pago están habilitados: `{ mercadopago, simulado }`                                                                            |
| POST                   | `/pagos/:pedidoId/simulado`      | Dueño         | Paga con una tarjeta de prueba (ver abajo)                                                                                                   |
| POST                   | `/pagos/:pedidoId/mercadopago`   | Dueño         | Crea la preferencia de Mercado Pago y devuelve `{ url }` para ir a pagar                                                                     |
| POST                   | `/pagos/:pedidoId/verificar`     | Dueño o admin | Busca en Mercado Pago un pago aprobado del pedido y, si coincide, lo acredita                                                                |
| POST                   | `/pagos/webhook`                 | Mercado Pago  | Recibe los avisos de pago de Mercado Pago                                                                                                    |
| GET                    | `/dashboard`                     | Admin         | Métricas de pedidos cobrados: totales, ventas por mes, más vendidos, ventas por categoría, pedidos por estado, mejores clientes y poco stock |

Códigos de respuesta que usa la API: `200` correcto, `201` creado, `400` datos inválidos, `401` sin sesión o sesión inválida, `403` sin permiso, `404` no existe, `402` pago rechazado, `409` conflicto (dato repetido, registro en uso, sin stock o un pedido que ya no admite ese cambio), `413` archivo demasiado grande, `429` demasiados intentos, `500` error inesperado y `502` Mercado Pago no respondió.

La sesión viaja en una cookie `httpOnly`. Para probar la API con Thunder Client o Postman, primero hacé el login: el programa guarda la cookie y la manda sola en los pedidos siguientes.

### Listado de productos

`GET /productos` acepta estos parámetros, todos opcionales:

| Parámetro                | Qué hace                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| `buscar`                 | Busca cada palabra en el nombre, la descripción, la marca y la categoría |
| `categoria`, `marca`     | Filtran por id                                                           |
| `conStock=1`             | Solo productos con stock                                                 |
| `precioMin`, `precioMax` | Rango de precio                                                          |
| `ids`                    | Lista de ids separados por comas (la usa el carrito)                     |
| `orden`                  | `recientes` (por defecto), `precio_asc`, `precio_desc` o `nombre`        |
| `pagina`, `porPagina`    | Página desde 1 y tamaño de 1 a 100 (por defecto 12)                      |

Responde `{ productos, total, pagina, porPagina, paginas }`. Un valor inválido responde `400`.

### Pedidos

`POST /pedidos` recibe:

```json
{
  "metodo_entrega": "envio",
  "provincia": "Tucumán",
  "direccion_envio": "Mitre 789, San Miguel de Tucumán",
  "items": [{ "producto_id": 20, "cantidad": 2 }]
}
```

Con `"metodo_entrega": "retiro"` no hace falta ni la provincia ni la dirección. Los precios y el costo del envío los pone la API: el envío depende de la zona de la provincia y es gratis desde $1.500.000 de subtotal.

Un pedido recorre estos estados:

| Estado      | Significa                                      | Pasa a                                                        |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------- |
| `pendiente` | Creado, con el stock reservado, esperando pago | `pagado` (al pagar) o `cancelado`                             |
| `pagado`    | Cobrado, listo para despachar o retirar        | `enviado` (envío), `entregado` (retiro) o `cancelado` (admin) |
| `enviado`   | En camino                                      | `entregado`                                                   |
| `entregado` | Recibido o retirado                            | —                                                             |
| `cancelado` | Cancelado, el stock volvió al catálogo         | — (el admin lo puede eliminar)                                |

Un pedido pendiente que no se paga en `MINUTOS_PARA_PAGAR` (30 por defecto) se cancela solo. Cada respuesta trae `segundos_para_pagar` con el tiempo que le queda.

### Pagos

**Pago simulado.** `POST /pagos/:pedidoId/simulado` recibe `{ numero, titular, vencimiento, cvv }`. Valida el número con el dígito verificador, el vencimiento (`MM/AA`) y el código, pero no cobra nada ni guarda la tarjeta. Sirve la tarjeta `4509 9535 6623 3704` con cualquier vencimiento futuro. Como en el sandbox de Mercado Pago, el titular decide el resultado:

| Titular        | Resultado                                    |
| -------------- | -------------------------------------------- |
| Cualquier otro | Aprobado                                     |
| `FUND`         | Rechazado por fondos insuficientes (`402`)   |
| `SECU`         | Rechazado por código de seguridad incorrecto |
| `EXPI`         | Rechazado por tarjeta vencida                |
| `OTHE`         | Rechazado por el banco                       |

**Mercado Pago.** Con `MP_ACCESS_TOKEN` cargado, `POST /pagos/:pedidoId/mercadopago` devuelve el link del Checkout Pro. Al terminar, Mercado Pago vuelve a `/pedidos/:id?pago=aprobado` (o `pendiente`, o `rechazado`) y el frontend llama a `/pagos/:pedidoId/verificar`. Si la API tiene una URL pública (`API_PUBLICA_URL`), Mercado Pago además avisa a `/pagos/webhook`. Los pasos para probarlo están en la [guía de instalación](../GUIA_DE_INSTALACION.md#pagos-con-mercado-pago).

### Correos

La API avisa por correo:

| Cuándo                                              | A quién               |
| --------------------------------------------------- | --------------------- |
| Se crea una cuenta                                  | Al usuario nuevo      |
| Se acredita el pago de un pedido                    | Al dueño del pedido   |
| El pedido sale, se entrega o se cancela             | Al dueño del pedido   |
| Se pide recuperar la contraseña                     | Al dueño de la cuenta |
| Cambia la contraseña (por enlace o desde Mi cuenta) | Al dueño de la cuenta |

Sin `SMTP_HOST`, los correos se muestran en la terminal del backend. Con Docker van a Mailpit (<http://localhost:8025>).

### Imágenes

Las imágenes subidas se sirven desde `http://localhost:3000/uploads/productos/...`, fuera de `/api`. El campo `imagen_url` de un producto puede ser una de esas rutas, una dirección externa (`https://...`) o una ruta de `frontend/public`.

## Vistas del frontend

### Panel del administrador (listado, alta y edición de cada tabla)

| Tabla        | Listado             | Creación                  | Edición                        |
| ------------ | ------------------- | ------------------------- | ------------------------------ |
| `productos`  | `/admin/productos`  | `/admin/productos/nuevo`  | `/admin/productos/:id/editar`  |
| `categorias` | `/admin/categorias` | `/admin/categorias/nueva` | `/admin/categorias/:id/editar` |
| `marcas`     | `/admin/marcas`     | `/admin/marcas/nueva`     | `/admin/marcas/:id/editar`     |
| `usuarios`   | `/admin/usuarios`   | `/admin/usuarios/nuevo`   | `/admin/usuarios/:id/editar`   |
| `pedidos`    | `/admin/pedidos`    | `/checkout`               | `/admin/pedidos/:id/editar`    |

Cualquier otra dirección muestra una página 404. La eliminación se hace desde cada listado, con una confirmación dentro de la misma fila.

### Resto de las vistas

| Ruta                                             | Vista                                                                                                                                      | Acceso                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `/`                                              | Inicio                                                                                                                                     | Público                    |
| `/catalogo` y `/catalogo/categoria/:categoriaId` | Catálogo con filtros, orden y paginación. Todos los filtros viajan en la URL (`buscar`, `marca`, `stock`, `min`, `max`, `orden`, `pagina`) | Público                    |
| `/producto/:id`                                  | Detalle de un producto                                                                                                                     | Público                    |
| `/carrito`                                       | Carrito                                                                                                                                    | Público                    |
| `/login` y `/registro`                           | Inicio de sesión y registro                                                                                                                | Solo sin sesión            |
| `/olvide-password`                               | Pedir el enlace para recuperar la contraseña                                                                                               | Solo sin sesión            |
| `/restablecer-password?token=...`                | Elegir la contraseña nueva desde el enlace del correo                                                                                      | Solo sin sesión            |
| `/dashboard`                                     | Panel principal (distinto según el rol)                                                                                                    | Con sesión                 |
| `/cuenta`                                        | Mi cuenta: datos personales y contraseña                                                                                                   | Con sesión                 |
| `/mis-pedidos`                                   | Listado de los pedidos propios                                                                                                             | Con sesión                 |
| `/checkout`                                      | Finalizar compra: entrega, envío y medio de pago                                                                                           | Con sesión                 |
| `/pedidos/:id`                                   | Detalle de un pedido: seguimiento, entrega, pago y, si está pendiente, las opciones para pagarlo o cancelarlo                              | Con sesión (dueño o admin) |
| `/pedidos/:id/pagar`                             | Pago simulado con tarjeta de prueba                                                                                                        | Con sesión (dueño)         |
