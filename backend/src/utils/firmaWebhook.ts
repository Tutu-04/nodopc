import { createHmac, timingSafeEqual } from 'node:crypto';

function leerFirma(encabezado: string | undefined): { ts?: string; v1?: string } {
  const partes = Object.fromEntries(
    String(encabezado ?? '')
      .split(',')
      .map((parte) => parte.trim().split('='))
  );
  return { ts: partes.ts, v1: partes.v1 };
}

interface DatosDeFirma {
  dataId: string;
  requestId: string;
  ts: string;
  secreto: string;
}

export function calcularFirma({ dataId, requestId, ts, secreto }: DatosDeFirma): string {
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifiesto = `id:${id};request-id:${requestId};ts:${ts};`;
  return createHmac('sha256', secreto).update(manifiesto).digest('hex');
}

interface FirmaRecibida {
  encabezado: string | undefined;
  requestId: string | undefined;
  dataId: string;
  secreto: string;
}

export function firmaEsValida({ encabezado, requestId, dataId, secreto }: FirmaRecibida): boolean {
  const { ts, v1 } = leerFirma(encabezado);
  if (!ts || !v1 || !requestId || !dataId) return false;

  const esperada = Buffer.from(calcularFirma({ dataId, requestId, ts, secreto }));
  const recibida = Buffer.from(v1);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
