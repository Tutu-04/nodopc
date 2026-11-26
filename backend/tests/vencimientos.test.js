import { beforeAll, describe, expect, it } from 'vitest';
import pool from '../src/db.js';
import { reiniciarBase } from '../src/migraciones.js';
import { cancelarVencidos } from '../src/models/pedido.model.js';
import { api, conSesion, ingresarComoCliente } from './ayudantes.js';

let cliente;

async function stockDe(id) {
  const respuesta = await api().get(`/api/productos/${id}`);
  return respuesta.body.stock;
}

async function crearPedido() {
  const respuesta = await api()
    .post('/api/pedidos')
    .set(conSesion(cliente))
    .send({ metodo_entrega: 'retiro', items: [{ producto_id: 12, cantidad: 2 }] });
  return respuesta.body;
}

async function estadoDe(id) {
  const [filas] = await pool.execute('SELECT estado FROM pedidos WHERE id = ?', [id]);
  return filas[0].estado;
}

beforeAll(async () => {
  await reiniciarBase();
  cliente = await ingresarComoCliente();
});

describe('Pedidos sin pagar', () => {
  it('se cancelan al vencer el plazo y devuelven el stock', async () => {
    const stockInicial = await stockDe(12);
    const vencido = await crearPedido();
    const vigente = await crearPedido();
    await pool.execute('UPDATE pedidos SET vence_en = NOW() - INTERVAL 1 MINUTE WHERE id = ?', [vencido.id]);

    expect(await cancelarVencidos()).toEqual([vencido.id]);
    expect(await estadoDe(vencido.id)).toBe('cancelado');
    expect(await estadoDe(vigente.id)).toBe('pendiente');
    expect(await stockDe(12)).toBe(stockInicial - 2);
  });

  it('no tocan los pedidos sin plazo ni los que ya se pagaron', async () => {
    expect(await cancelarVencidos()).toEqual([]);
    expect(await estadoDe(23)).toBe('pendiente');

    await pool.execute('UPDATE pedidos SET vence_en = NOW() - INTERVAL 1 DAY WHERE id IN (23, 26)');

    expect(await cancelarVencidos()).toEqual([23]);
    expect(await estadoDe(23)).toBe('cancelado');
    expect(await estadoDe(26)).toBe('pagado');
    expect(await cancelarVencidos()).toEqual([]);
  });
});
