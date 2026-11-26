# Seguridad

Qué protecciones tiene NodoPC, dónde está cada una en el código y cómo comprobar que funcionan.

## Resumen

| Protección                    | Qué evita                                                            | Dónde                                                      |
| ----------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| Contraseñas con bcrypt        | Que un robo de la base exponga las contraseñas                       | `controllers/auth.controller.js`, `usuarios.controller.js` |
| Contraseñas exigentes         | Contraseñas fáciles de adivinar                                      | `utils/validaciones.js` → `validarPassword`                |
| Sesión en cookie `httpOnly`   | Que un script inyectado en la página robe la sesión                  | `utils/sesion.js`, `middlewares/auth.js`                   |
| `SameSite=Lax` y CORS         | Que otro sitio haga pedidos en nombre del usuario (CSRF)             | `utils/sesion.js`, `app.js`                                |
| Rol verificado en la base     | Que alguien conserve el acceso de administrador después de perderlo  | `middlewares/auth.js` → `soloAdmin`                        |
| Límite de intentos            | Adivinar contraseñas por fuerza bruta                                | `middlewares/limites.js`                                   |
| Login en tiempo constante     | Averiguar qué emails tienen cuenta midiendo el tiempo de respuesta   | `controllers/auth.controller.js` → `iniciarSesion`         |
| Encabezados de helmet         | Ataques comunes del navegador, y anunciar que el servidor es Express | `app.js`                                                   |
| Consultas parametrizadas      | Inyección SQL                                                        | Todos los archivos de `models/`                            |
| El precio lo pone el servidor | Comprar más barato cambiando el precio desde el navegador            | `models/pedido.model.js`                                   |
| Stock bloqueado al comprar    | Vender más unidades de las que hay cuando dos compras coinciden      | `models/pedido.model.js` → `crear`                         |
| Pagos verificados en origen   | Marcar un pedido como pagado sin haber pagado, o pagando menos       | `controllers/pagos.controller.js`                          |
| Firma de las notificaciones   | Que alguien se haga pasar por Mercado Pago                           | `utils/firmaWebhook.js`                                    |
| Límite de pagos rechazados    | Usar el pago simulado para probar tarjetas                           | `middlewares/limites.js`                                   |
| Usuario de MySQL propio       | Que la aplicación pueda tocar otras bases del servidor               | `docker-compose.yml`                                       |

Todas las rutas son relativas a `backend/src/`, salvo `docker-compose.yml`.

## Contraseñas

- Se guardan con `bcrypt.hash(password, 10)`. Nunca se guarda ni se devuelve la contraseña real.
- Tienen que tener entre 8 y 72 caracteres, con al menos una letra y un número. 72 es el máximo que procesa bcrypt. El frontend usa el mismo patrón para avisar antes de enviar.
- Si el email no existe, el login igual compara contra un hash de relleno. Así tarda lo mismo y no revela qué cuentas hay.
- Después de 10 intentos fallidos en 15 minutos desde la misma conexión, la API responde `429`. Los logins correctos no cuentan.

## Sesión

1. El login firma un JWT con `id`, `nombre` y `rol`, que vence a las 8 horas. Se firma y se verifica solo con HS256.
2. El token va en la cookie `nodopc_sesion`, con `HttpOnly` (JavaScript no la puede leer) y `SameSite=Lax` (el navegador no la manda en pedidos `POST`, `PUT` o `DELETE` que salen de otro sitio). Con `COOKIE_SEGURA=true` se agrega `Secure`, para cuando la tienda corre con HTTPS.
3. El navegador guarda en `localStorage` solo el nombre y el rol, para dibujar el menú. Al abrir la tienda, `GET /api/auth/yo` confirma esos datos con la cuenta real.
4. `verificarToken` lee la cookie en cada ruta privada y responde `401` si falta o no es válida. Las rutas de administrador pasan además por `soloAdmin`, que confirma el rol actual en la base.
5. `POST /api/auth/salir` borra la cookie.

**Límite conocido:** un JWT no se puede anular antes de que venza. Si alguien copiara la cookie de otra persona, le serviría hasta 8 horas aunque esa persona cierre sesión, salvo en las rutas de administrador, que miran el rol en la base. Resolverlo del todo requiere guardar las sesiones en el servidor.

## Pedidos y pagos

- **Stock.** Al crear un pedido, cada producto se lee con `SELECT ... FOR UPDATE` dentro de la transacción. Si dos clientes compran la última unidad al mismo tiempo, el segundo espera al primero y recibe `409`. Un test dispara compras en paralelo para comprobarlo.
- **Montos.** El total lo calcula la API con los precios y el costo de envío de la base. Un pago de Mercado Pago solo acredita el pedido si está aprobado, si su `external_reference` es el pedido, si la moneda es ARS y si el monto es exactamente el total guardado.
- **Notificaciones.** Con `MP_WEBHOOK_SECRET`, cada aviso tiene que traer una firma `x-signature` válida (HMAC-SHA256 del id, el request-id y el timestamp), que se compara en tiempo constante. Aun con la firma válida, la API no confía en el contenido: vuelve a pedirle el pago a Mercado Pago con su propia credencial.
- **Avisos repetidos.** `marcarPagado` solo cambia pedidos pendientes, así que un aviso que llega dos veces no tiene efecto. Si un pago se acredita sobre un pedido que ya se canceló, queda registrado en el log para devolver el dinero.
- **Tarjetas.** El pago simulado valida los datos y los descarta: el pedido guarda solo el medio y un id de operación. Después de 10 pagos rechazados en 15 minutos desde la misma conexión, responde `429`.
- **Credenciales.** `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` viven solo en `backend/.env`, que no se sube al repositorio. El frontend nunca las ve.

## Usuario de MySQL con permisos mínimos

Con Docker, la aplicación se conecta como `nodopc`, que solo tiene permisos sobre la base `tienda_hardware`. Sin Docker, se puede hacer lo mismo con un MySQL instalado:

```sql
CREATE USER 'nodopc'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON tienda_hardware.* TO 'nodopc'@'localhost';
GRANT ALL PRIVILEGES ON tienda_hardware_test.* TO 'nodopc'@'localhost';
```

Después, en `backend/.env`: `DB_USER=nodopc` y `DB_PASSWORD=una-clave-segura`.

## Cómo comprobarlo

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

**2. La sesión no está al alcance de JavaScript.**

1. Iniciá sesión y apretá `F12`.
2. Pestaña **Application** → **Cookies** → `http://localhost:5173`: está `nodopc_sesion`, con la columna **HttpOnly** marcada.
3. Pestaña **Console**: escribí `document.cookie` y apretá Enter. Devuelve un texto vacío, porque una cookie `HttpOnly` no se puede leer desde JavaScript.
4. Pestaña **Application** → **Local Storage** → `nodopc-sesion`: solo están el nombre y el rol, sin token.

**3. El backend no se deja engañar.**

- **Cambiar el rol a mano:** ingresá como cliente, editá `nodopc-sesion` en Local Storage, cambiá `"rol":"cliente"` por `"rol":"admin"` y recargá. Al abrir la tienda, `GET /api/auth/yo` corrige el rol y el menú de administración desaparece.
- **Borrar la cookie:** en **Application** → **Cookies**, borrá `nodopc_sesion` y recargá una página privada. La API responde `401` y la tienda te manda al login.
- **Probar contraseñas:** equivocate 10 veces seguidas en el login. El intento siguiente responde "Demasiados intentos fallidos".
