import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { enviarCorreo } from '../src/services/correo.js';
import { api } from './ayudantes.js';

vi.mock('../src/services/correo.js', () => ({ enviarCorreo: vi.fn(async () => true) }));

function correosA(email) {
  return vi
    .mocked(enviarCorreo)
    .mock.calls.map(([correo]) => correo)
    .filter((correo) => correo.para === email);
}

beforeAll(reiniciarBase);

beforeEach(() => {
  vi.mocked(enviarCorreo).mockClear();
});

describe('Correo de bienvenida', () => {
  it('se manda al registrarse, con el nombre escapado', async () => {
    const respuesta = await api()
      .post('/api/auth/registro')
      .send({ nombre: 'Ana <b>Pérez</b>', email: 'ana@example.com', password: 'clave1234' });
    expect(respuesta.status).toBe(201);

    const [correo] = correosA('ana@example.com');
    expect(correo.asunto).toBe('Te damos la bienvenida a NodoPC');
    expect(correo.html).toContain('¡Hola, Ana!');
    expect(correo.texto).toContain('http://localhost:5173/catalogo');
  });

  it('no se manda si el registro falla', async () => {
    await api().post('/api/auth/registro').send({ nombre: 'Ana', email: 'ana@example.com', password: 'clave1234' });
    expect(enviarCorreo).not.toHaveBeenCalled();
  });
});
