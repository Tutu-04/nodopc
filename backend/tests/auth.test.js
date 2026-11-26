import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import jwt from 'jsonwebtoken';
import { api, conSesion, ingresarComoAdmin } from './ayudantes.js';

beforeAll(reiniciarBase);

describe('POST /api/auth/login', () => {
  it('rechaza un pedido sin datos', async () => {
    const respuesta = await api().post('/api/auth/login');
    expect(respuesta.status).toBe(400);
  });

  it('rechaza un JSON mal armado', async () => {
    const respuesta = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{mal');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toMatch(/JSON/);
  });

  it('responde lo mismo si la contraseña es incorrecta o el email no existe', async () => {
    const malaPassword = await api().post('/api/auth/login').send({ email: 'admin@nodopc.com', password: 'nope' });
    const sinCuenta = await api().post('/api/auth/login').send({ email: 'nadie@nodopc.com', password: 'nope' });

    expect(malaPassword.status).toBe(401);
    expect(sinCuenta.status).toBe(401);
    expect(malaPassword.body.error).toBe(sinCuenta.body.error);
  });

  it('guarda la sesión en una cookie httpOnly y devuelve el usuario sin la contraseña', async () => {
    const respuesta = await api().post('/api/auth/login').send({ email: 'admin@nodopc.com', password: 'admin123' });
    const cookie = respuesta.headers['set-cookie'][0];

    expect(respuesta.status).toBe(200);
    expect(cookie).toMatch(/^nodopc_sesion=[\w-]+\.[\w-]+\.[\w-]+;/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(respuesta.body).not.toHaveProperty('token');
    expect(respuesta.body.usuario).toMatchObject({ email: 'admin@nodopc.com', rol: 'admin' });
    expect(respuesta.body.usuario).not.toHaveProperty('password');
  });
});

describe('POST /api/auth/registro', () => {
  it.each([
    ['nombre muy corto', { nombre: 'a', email: 'x@x.com', password: 'clave1234' }],
    ['email inválido', { nombre: 'Ana', email: 'xx', password: 'clave1234' }],
    ['contraseña muy corta', { nombre: 'Ana', email: 'ana@x.com', password: 'abc123' }],
    ['contraseña sin números', { nombre: 'Ana', email: 'ana@x.com', password: 'solamenteletras' }],
    ['contraseña sin letras', { nombre: 'Ana', email: 'ana@x.com', password: '1234567890' }],
  ])('rechaza un %s', async (_caso, datos) => {
    const respuesta = await api().post('/api/auth/registro').send(datos);
    expect(respuesta.status).toBe(400);
  });

  it('rechaza un email que ya está registrado', async () => {
    const respuesta = await api()
      .post('/api/auth/registro')
      .send({ nombre: 'Ana', email: 'admin@nodopc.com', password: 'clave1234' });
    expect(respuesta.status).toBe(409);
  });

  it('crea siempre un cliente aunque se pida otro rol, y la cuenta puede ingresar', async () => {
    const registro = await api()
      .post('/api/auth/registro')
      .send({ nombre: 'Ana Nueva', email: 'ana@prueba.com', password: 'secreta1', rol: 'admin' });

    expect(registro.status).toBe(201);
    expect(registro.body.rol).toBe('cliente');
    expect(registro.body).not.toHaveProperty('password');

    const login = await api().post('/api/auth/login').send({ email: 'ana@prueba.com', password: 'secreta1' });
    expect(login.status).toBe(200);
  });
});

describe('Rutas protegidas', () => {
  it('piden iniciar sesión si no hay token', async () => {
    const respuesta = await api().get('/api/pedidos/mios');
    expect(respuesta.status).toBe(401);
  });

  it('rechazan un token inventado', async () => {
    const respuesta = await api().get('/api/pedidos/mios').set(conSesion('nodopc_sesion=abc.def.ghi'));
    expect(respuesta.status).toBe(401);
  });

  it('rechazan un token firmado con otra clave, aunque diga que es admin', async () => {
    const falso = jwt.sign({ id: 1, nombre: 'Intruso', rol: 'admin' }, 'otra-clave');
    const respuesta = await api()
      .get('/api/usuarios')
      .set(conSesion(`nodopc_sesion=${falso}`));
    expect(respuesta.status).toBe(401);
  });

  it('no aceptan el token en la cabecera Authorization', async () => {
    const cookie = await ingresarComoAdmin();
    const token = cookie.split('=')[1];
    const respuesta = await api().get('/api/usuarios').set('Authorization', `Bearer ${token}`);
    expect(respuesta.status).toBe(401);
  });

  it('responden 404 en una ruta que no existe', async () => {
    const respuesta = await api().get('/api/nada');
    expect(respuesta.status).toBe(404);
  });
});

describe('Tiempo de respuesta del login', () => {
  it('tarda lo mismo si el email no existe, para no revelar qué cuentas hay', async () => {
    const medir = async (email) => {
      const inicio = performance.now();
      await api().post('/api/auth/login').send({ email, password: 'incorrecta1' });
      return performance.now() - inicio;
    };

    await medir('admin@nodopc.com');
    const conCuenta = await medir('admin@nodopc.com');
    const sinCuenta = await medir('nadie@nodopc.com');

    expect(sinCuenta).toBeGreaterThan(conCuenta * 0.5);
  });
});

describe('GET /api/auth/yo y POST /api/auth/salir', () => {
  it('devuelve el usuario de la sesión actual', async () => {
    const cookie = await ingresarComoAdmin();
    const respuesta = await api().get('/api/auth/yo').set(conSesion(cookie));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuario).toMatchObject({ id: 1, rol: 'admin' });
  });

  it('responde 401 sin sesión', async () => {
    expect((await api().get('/api/auth/yo')).status).toBe(401);
  });

  it('salir borra la cookie', async () => {
    const respuesta = await api().post('/api/auth/salir');
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['set-cookie'][0]).toMatch(/^nodopc_sesion=;.*Expires=Thu, 01 Jan 1970/);
  });
});
