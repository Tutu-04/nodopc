# Seguridad: bcrypt y JWT

Las contraseñas se guardan hasheadas con bcrypt y la sesión viaja en un token JWT firmado. Este documento muestra dónde está cada parte en el código y cómo comprobar que funciona.

## Dónde está en el código

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
