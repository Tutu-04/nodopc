import { config } from '../config.js';

const NARANJA = '#c2410c';

export function escaparHtml(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function enlace(ruta) {
  return `${config.frontendUrl}${ruta}`;
}

export function armarCorreo({ titulo, parrafos, tabla = [], boton, notaFinal }) {
  const filasHtml = tabla
    .map(
      ([etiqueta, valor]) =>
        `<tr><td style="padding:6px 0;color:#525252">${escaparHtml(etiqueta)}</td>` +
        `<td style="padding:6px 0;text-align:right;font-weight:600">${escaparHtml(valor)}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #e5e5e5;font-size:18px;font-weight:900;letter-spacing:4px">NODO<span style="color:${NARANJA}">PC</span></td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 16px;font-size:22px">${escaparHtml(titulo)}</h1>
          ${parrafos.map((parrafo) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.5">${escaparHtml(parrafo)}</p>`).join('')}
          ${filasHtml ? `<table role="presentation" width="100%" style="margin:8px 0 18px;font-size:14px;border-top:1px solid #e5e5e5">${filasHtml}</table>` : ''}
          ${boton ? `<p style="margin:22px 0"><a href="${escaparHtml(boton.url)}" style="display:inline-block;background:${NARANJA};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">${escaparHtml(boton.texto)}</a></p>` : ''}
          ${notaFinal ? `<p style="margin:18px 0 0;font-size:13px;color:#737373">${escaparHtml(notaFinal)}</p>` : ''}
        </td></tr>
      </table>
      <p style="font-size:12px;color:#a3a3a3">NodoPC · Componentes, PC armadas, monitores y periféricos</p>
    </td></tr>
  </table>
</body>
</html>`;

  const texto = [
    titulo,
    '',
    ...parrafos,
    ...(tabla.length ? ['', ...tabla.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`)] : []),
    ...(boton ? ['', `${boton.texto}: ${boton.url}`] : []),
    ...(notaFinal ? ['', notaFinal] : []),
  ].join('\n');

  return { html, texto };
}
