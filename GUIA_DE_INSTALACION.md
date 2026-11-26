# Guía de instalación — NodoPC

Cómo dejar funcionando el proyecto en una computadora con Windows, desde cero.

**Resumen:** instalás Node.js, VS Code y MySQL (o XAMPP). Después, desde la carpeta del proyecto, corrés 4 comandos: `npm run instalar`, `npm run crear-base`, `npm run backend` y `npm run frontend`.

---

## 1. Qué hay que instalar

| Programa                            | ¿Obligatorio?      | Para qué sirve                                                             |
| ----------------------------------- | ------------------ | -------------------------------------------------------------------------- |
| **Node.js** (versión LTS)           | Sí                 | Ejecuta el backend y el frontend. Trae `npm` incluido.                     |
| **Visual Studio Code**              | Sí (recomendado)   | Editor de código con terminal incorporada.                                 |
| **MySQL**: XAMPP **o** MySQL Server | Sí, uno de los dos | La base de datos.                                                          |
| MySQL Workbench                     | No                 | Programa con ventanas para mirar las tablas.                               |
| Git                                 | No                 | Para clonar el repositorio. Sin Git, se puede bajar como ZIP desde GitHub. |

### 1.1 Node.js

1. Entrá a <https://nodejs.org>.
2. Descargá la versión **LTS** (el botón verde).
3. Abrí el instalador y avanzá con **Next** dejando todo como viene. Si aparece la casilla _"Automatically install the necessary tools"_, dejala **sin marcar**.
4. Para comprobar que quedó instalado, abrí una terminal nueva (PowerShell) y escribí:

```powershell
node -v
npm -v
```

Tienen que aparecer dos números de versión. Para Node, tiene que ser **22 o mayor**.

### 1.2 Visual Studio Code

1. Descargalo de <https://code.visualstudio.com> e instalalo con las opciones por defecto.
2. Durante la instalación, marcá **"Agregar a PATH"** si te lo ofrece.

### 1.3 Extensiones de VS Code

Ninguna es obligatoria: el proyecto funciona sin ellas. Para instalarlas: en VS Code, clic en el ícono de **Extensiones** de la barra izquierda (o `Ctrl + Shift + X`), buscalas por nombre y apretá **Install**.

| Extensión                            | Para qué sirve                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| **Tailwind CSS IntelliSense**        | Autocompleta las clases de Tailwind y muestra qué hace cada una al pasar el mouse. |
| **Prettier - Code formatter**        | Ordena el código automáticamente (sangrías, comillas, etc.).                       |
| **Spanish Language Pack** (opcional) | Pone los menús de VS Code en español.                                              |
| **Thunder Client** (opcional)        | Permite probar la API (GET, POST, PUT, DELETE) desde VS Code, sin el frontend.     |

### 1.4 MySQL

Elegí **una** opción:

| Opción                      | Cuándo conviene                                                 |
| --------------------------- | --------------------------------------------------------------- |
| **A. XAMPP**                | Es la más simple. El usuario `root` no tiene contraseña.        |
| **B. MySQL Server**         | Es el MySQL oficial. Pide crear una contraseña al instalarlo.   |
| **C. La PC ya tiene MySQL** | Si en esa máquina ya hay un MySQL instalado (ver el punto 1.5). |

#### Opción A: XAMPP

1. Descargalo de <https://www.apachefriends.org> e instalalo avanzando con **Next**.
2. Abrí **XAMPP Control Panel**.
3. En la fila **MySQL**, clic en **Start**. Tiene que quedar en verde.

Cada vez que quieras usar el proyecto, tenés que abrir XAMPP y darle **Start** a MySQL.

#### Opción B: MySQL Server

1. Entrá a <https://dev.mysql.com/downloads/mysql/>, elegí la versión **8.4 LTS** y **Microsoft Windows**, y descargá el **MSI Installer**.
2. Cuando ofrezca crear una cuenta, clic en **No thanks, just start my download**.
3. Instalalo con **Next**. Al terminar se abre **MySQL Configurator**.
4. Avanzá con las opciones por defecto (puerto **3306**).
5. Cuando pida la contraseña de **root**, escribí una y **anotala**.
6. Terminá con **Execute** y **Finish**.

MySQL queda como servicio de Windows: arranca solo al prender la PC.

### 1.5 ¿La PC ya tiene un MySQL instalado?

Conviene revisarlo **antes** de instalar XAMPP, porque dos MySQL no pueden usar el mismo puerto. En una terminal escribí:

```powershell
netstat -ano | findstr :3306
```

- **Si no aparece nada:** el puerto está libre. Seguí con la opción A o B.
- **Si aparece una línea con `LISTENING`:** ya hay un MySQL instalado. Tenés dos caminos:
  - **Usar ese MySQL** (opción C): necesitás saber la contraseña de su usuario `root`. Va en el `.env` (paso 3).
  - **Usar XAMPP en otro puerto**: seguí la sección 8.3.

---

## 2. Preparar la carpeta del proyecto

1. Bajá el proyecto en una carpeta **fuera de OneDrive**, por ejemplo `C:\proyectos`. Hay dos formas:

   - **Con Git:** en una terminal, escribí `cd C:\proyectos` y después `git clone https://github.com/Tutu-04/nodopc.git`. Se crea la carpeta `C:\proyectos\nodopc`.
   - **Sin Git:** en <https://github.com/Tutu-04/nodopc>, botón verde **Code** → **Download ZIP**. Descomprimilo en `C:\proyectos`. La carpeta se llama `nodopc-main`.

   > OneDrive intenta sincronizar la carpeta `node_modules`, que tiene miles de archivos. Eso hace que la instalación tarde muchísimo o falle.

2. Abrí VS Code → menú **Archivo** → **Abrir carpeta...** → elegí la carpeta `nodopc` (o `nodopc-main`, si bajaste el ZIP).

   La carpeta correcta es la que tiene adentro estas cuatro carpetas y el archivo `package.json`:

   ```
   nodopc\
   ├── backend\
   ├── database\
   ├── docs\
   ├── frontend\
   └── package.json
   ```

   Si al descomprimir el ZIP te quedó `nodopc-main\nodopc-main\`, abrí la de **adentro**.

3. Abrí una terminal en VS Code: menú **Terminal** → **Nueva terminal** (o `Ctrl + ñ`).

4. Instalá las dependencias del backend y del frontend con un solo comando:

```powershell
npm run instalar
```

Tarda uno o dos minutos. Al final no tiene que aparecer ningún `npm error`.

> Avisos que podés ignorar:
>
> - `npm warn allow-scripts ... bcrypt`: no es un error, bcrypt funciona igual.
> - `1 high severity vulnerability` (o parecido) en el frontend: viene de una herramienta interna de Vite que solo se usa mientras programás, no de la página. **No corras** `npm audit fix --force`: cambia la versión de Vite y puede romper el proyecto.

---

## 3. Configurar la conexión a MySQL (archivo `.env`)

1. En el panel izquierdo de VS Code, abrí la carpeta `backend`.
2. Clic derecho sobre `.env.example` → **Copiar**. Clic derecho sobre la carpeta `backend` → **Pegar**.
3. Renombrá la copia (clic derecho → **Cambiar nombre**, o `F2`) a exactamente `.env`.
4. Abrí `.env` y completá según tu MySQL:

| Línea         | XAMPP                             | MySQL Server / MySQL que ya estaba |
| ------------- | --------------------------------- | ---------------------------------- |
| `DB_HOST`     | `127.0.0.1`                       | `127.0.0.1`                        |
| `DB_PORT`     | `3306` (o `3307` si lo cambiaste) | `3306`                             |
| `DB_USER`     | `root`                            | `root`                             |
| `DB_PASSWORD` | **vacío** (`DB_PASSWORD=`)        | la contraseña de root              |

5. En `JWT_SECRET` poné una frase larga cualquiera.
6. Guardá con `Ctrl + S`.

Ejemplo con XAMPP:

```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tienda_hardware
JWT_SECRET=mi_frase_secreta_para_el_proyecto_2026
```

---

## 4. Crear la base de datos

Con MySQL encendido, en la terminal de VS Code (parado en la carpeta del proyecto):

```powershell
npm run crear-base
```

Tiene que decir:

```
Base de datos "tienda_hardware" creada con los datos de prueba.
```

Este comando ejecuta el archivo `database\tienda_hardware.sql`. No hace falta abrir Workbench ni phpMyAdmin.

> **Ojo:** si la base ya existía, la borra y la crea de nuevo. Sirve para volver a los datos de prueba originales cuando quieras.

Si da error, el mensaje dice qué revisar. Los casos más comunes están en la sección 8.

---

## 5. Arrancar el proyecto

Hacen falta **dos terminales abiertas al mismo tiempo**: una para el backend y otra para el frontend.

### Terminal 1: backend

```powershell
npm run backend
```

Tiene que mostrar:

```
API escuchando en http://localhost:3000
Conectado a MySQL
```

**No cierres esta terminal.** Si la cerrás, se apaga el backend.

### Terminal 2: frontend

1. Abrí otra terminal con el botón **+** del panel de terminales.
2. Escribí:

```powershell
npm run frontend
```

3. Va a mostrar una dirección. Hacé `Ctrl + clic` sobre <http://localhost:5173> o escribila en el navegador.

### Para apagar todo

En cada terminal, apretá `Ctrl + C`.

---

## 6. Usuarios de prueba

| Rol           | Email                | Contraseña   |
| ------------- | -------------------- | ------------ |
| Administrador | `admin@nodopc.com`   | `admin123`   |
| Cliente       | `cliente@nodopc.com` | `cliente123` |
| Cliente       | `maria@nodopc.com`   | `cliente123` |

---

## 7. La segunda vez (el día de la presentación)

Una vez instalado, para volver a usarlo solo hace falta:

1. Encender MySQL (XAMPP: **Start** en MySQL; MySQL Server arranca solo).
2. Abrir la carpeta en VS Code.
3. Terminal 1: `npm run backend`
4. Terminal 2: `npm run frontend`
5. Abrir <http://localhost:5173>

Si querés empezar la demo con los datos de prueba limpios, corré antes `npm run crear-base`.

---

## 8. Problemas frecuentes

### 8.1 `npm error enoent Could not read package.json`

Estás parado en una carpeta que no es la del proyecto. Abrí en VS Code la carpeta que tiene adentro `backend`, `frontend` y `package.json` (sección 2, paso 2).

### 8.2 `Access denied for user 'root'@'localhost'`

MySQL rechazó la contraseña del `.env`.

- `using password: NO` → dejaste `DB_PASSWORD` vacío, pero ese MySQL **tiene** contraseña.
- `using password: YES` → la contraseña puesta es incorrecta.

Si estás usando XAMPP y aparece este error, casi seguro hay **otro MySQL** instalado en la PC atendiendo en el puerto 3306. Revisalo como en la sección 1.5.

Después de cambiar el `.env`, frená el backend con `Ctrl + C` y volvé a correr `npm run backend`.

### 8.3 XAMPP: `MySQL shutdown unexpectedly`

MySQL de XAMPP arranca y se apaga enseguida. Hay dos causas posibles.

**Causa 1: otro MySQL ocupa el puerto 3306.** Revisalo con `netstat -ano | findstr :3306`. Si aparece una línea con `LISTENING` aunque XAMPP esté apagado, es eso. Para mover XAMPP al puerto 3307:

1. En XAMPP, fila **MySQL** → **Config** → **my.ini**.
2. Con `Ctrl + H`, reemplazá `3306` por `3307` → **Reemplazar todo** → guardá.
3. Dale **Start** a MySQL.
4. En el `.env`, poné `DB_PORT=3307`.
5. Corré `npm run crear-base` y después `npm run backend`.

**Causa 2: los archivos de datos de XAMPP se dañaron.** Pasa después de apagar la PC con MySQL prendido, o después de varios arranques fallidos. Para restaurarlos:

1. Fijate que MySQL esté frenado en XAMPP.
2. Andá a `C:\xampp\mysql`.
3. Renombrá la carpeta `data` a `data_old`.
4. Copiá la carpeta `backup` (copiar y pegar) y renombrá la copia a `data`.
5. Dale **Start** a MySQL.

Si en esa PC había otras bases de datos en uso, copiá sus carpetas desde `data_old` a `data`, junto con el archivo `ibdata1`.

Si sigue fallando: XAMPP → fila MySQL → **Logs** → **mysql_error.log**, y revisá las últimas líneas.

### 8.4 `MySQL no está encendido en 127.0.0.1:3306`

MySQL está apagado o el puerto del `.env` no es el correcto. Encendelo (XAMPP: **Start**) y revisá `DB_PORT`.

### 8.5 `La base tienda_hardware todavía no existe`

Corré `npm run crear-base`.

### 8.6 `No se encontró el archivo .env`

Falta crear el `.env` en la carpeta `backend` (sección 3).

### 8.7 La página muestra "No se pudo conectar con el servidor"

El backend está apagado. Revisá que la terminal 1 siga abierta con `npm run backend` corriendo.

### 8.8 `EADDRINUSE` o "el puerto 3000 está en uso"

Ya hay un backend corriendo, seguramente en otra terminal. Cerrá esa terminal o apretá `Ctrl + C` en ella.

### 8.9 La terminal dice que no reconoce `node` o `npm`

Node.js no está instalado, o VS Code estaba abierto cuando lo instalaste. Cerrá VS Code por completo y abrilo de nuevo. Si sigue igual, reinstalá Node.js (sección 1.1).

---

## 9. Comandos de referencia

Todos se corren desde la carpeta principal del proyecto.

| Comando              | Qué hace                                                 | ¿Cuándo?                            |
| -------------------- | -------------------------------------------------------- | ----------------------------------- |
| `npm run instalar`   | Instala las dependencias de backend y frontend           | Una vez, al copiar el proyecto      |
| `npm run crear-base` | Crea la base con los datos de prueba (borra la anterior) | Una vez, o para reiniciar los datos |
| `npm run backend`    | Arranca la API en el puerto 3000                         | Cada vez (terminal 1)               |
| `npm run frontend`   | Arranca la página en el puerto 5173                      | Cada vez (terminal 2)               |
