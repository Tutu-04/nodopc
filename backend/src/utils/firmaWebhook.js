import { createHmac, timingSafeEqual } from 'node:crypto';

function leerFirma(encabezado) {
  const partes = Object.fromEntries(
    String(encabezado ?? '')
      .split(',')
      .map((parte) => parte.trim().split('='))
  );
  return { ts: partes.ts, v1: partes.v1 };
}

export function calcularFirma({ dataId, requestId, ts, secreto }) {
  const id = /^[a-z0-9]+$/i.test(dataId) ? String(dataId).toLowerCase() : dataId;
  const manifiesto = `id:${id};request-id:${requestId};ts:${ts};`;
  return createHmac('sha256', secreto).update(manifiesto).digest('hex');
}

export function firmaEsValida({ encabezado, requestId, dataId, secreto }) {
  const { ts, v1 } = leerFirma(encabezado);
  if (!ts || !v1 || !requestId || !dataId) return false;

  const esperada = Buffer.from(calcularFirma({ dataId, requestId, ts, secreto }));
  const recibida = Buffer.from(v1);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
