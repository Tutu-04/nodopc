import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import pool from '../src/db.js';
import { reiniciarBase } from '../src/migraciones.js';
import { enviarCorreo } from '../src/services/correo.js';
import { api } from './ayudantes.js';

vi.mock('../src/services/correo.js', () => ({ enviarCorreo: vi.fn(async () => true) }));

const EMAIL = 'maria@nodopc.com';

function pedirEnlace(email = EMAIL) {
  return api().post('/api/auth/olvide-password').send({ email });
}

async function tokenDelCorreo() {
  await vi.waitFor(() => expect(enviarCorreo).toHaveBeenCalled());
  const [{ texto }] = vi.mocked(enviarCorreo).mock.calls.at(-1);
  return new URL(texto.match(/http\S+/)[0]).searchParams.get('token');
}

function restablecer(token, password = 'nueva1234') {
  return api().post('/api/auth/restablecer-password').send({ token, password });
}

function ingresar(password) {
  return api().post('/api/auth/login').send({ email: EMAIL, password });
}

beforeAll(reiniciarBase);

beforeEach(() => {
  vi.mocked(enviarCorreo).mockClear();
});

describe('Pedir el enlace', () => {
  it('valida el email', async () => {
    expect((await pedirEnlace('no-es-un-email')).status).toBe(400);
  });

  it('responde lo mismo exista o no la cuenta, y solo manda correo si existe', async () => {
    const sinCuenta = await pedirEnlace('nadie@nodopc.com');
    const conCuenta = await pedirEnlace(EMAIL);

    expect(sinCuenta.status).toBe(200);
    expect(sinCuenta.body).toEqual(conCuenta.body);

    await vi.waitFor(() => expect(enviarCorreo).toHaveBeenCalledTimes(1));
    const [correo] = vi.mocked(enviarCorreo).mock.calls[0];
    expect(correo.para).toBe(EMAIL);
    expect(correo.texto).toMatch(/http:\/\/localhost:5173\/restablecer-password\?token=[\w-]{43}/);
  });

  it('guarda solo el hash del token', async () => {
    await pedirEnlace();
    const token = await tokenDelCorreo();

    const [filas] = await pool.execute('SELECT token_hash FROM recuperaciones_password');
    expect(filas.map((fila) => fila.token_hash)).not.toContain(token);
    expect(filas.every((fila) => /^[0-9a-f]{64}$/.test(fila.token_hash))).toBe(true);
  });
});

describe('Elegir la contraseña nueva', () => {
  it('cambia la contraseña y el enlace no sirve dos veces', async () => {
    await pedirEnlace();
    const token = await tokenDelCorreo();

    expect((await restablecer(token, 'corta')).status).toBe(400);

    const respuesta = await restablecer(token);
    expect(respuesta.status).toBe(200);
    expect((await ingresar('cliente123')).status).toBe(401);
    expect((await ingresar('nueva1234')).status).toBe(200);

    const otraVez = await restablecer(token, 'otra12345');
    expect(otraVez.status).toBe(400);
    expect(otraVez.body.error).toMatch(/venció o ya se usó/);
  });

  it('al usar un enlace se anulan los demás de la misma cuenta', async () => {
    await pedirEnlace();
    const primero = await tokenDelCorreo();
    vi.mocked(enviarCorreo).mockClear();
    await pedirEnlace();
    const segundo = await tokenDelCorreo();

    expect((await restablecer(segundo, 'segunda1234')).status).toBe(200);
    expect((await restablecer(primero, 'primera1234')).status).toBe(400);
  });

  it('rechaza un enlace vencido o inventado', async () => {
    await pedirEnlace();
    const token = await tokenDelCorreo();
    await pool.execute('UPDATE recuperaciones_password SET vence_en = NOW() - INTERVAL 1 MINUTE');

    expect((await restablecer(token)).status).toBe(400);
    expect((await restablecer('x'.repeat(43))).status).toBe(400);
    expect((await restablecer(undefined)).status).toBe(400);
  });
});
