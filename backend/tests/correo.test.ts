import { describe, expect, it } from 'vitest';
import { armarCorreo, escaparHtml } from '../src/correos/plantilla.js';
import { enviarCorreo } from '../src/services/correo.js';

describe('Plantilla de los correos', () => {
  it('escapa el HTML de los datos que escribe el usuario', () => {
    expect(escaparHtml('<script>alert("x")</script> & \'y\'')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;'
    );
  });

  it('arma la versión HTML y la de texto con el mismo contenido', () => {
    const { html, texto } = armarCorreo({
      titulo: 'Hola <b>Ana</b>',
      parrafos: ['Primer párrafo'],
      tabla: [['Total', '$ 10']],
      boton: { texto: 'Ver pedido', url: 'http://localhost:5173/pedidos/1' },
      notaFinal: 'Nota',
    });

    expect(html).toContain('Hola &lt;b&gt;Ana&lt;/b&gt;');
    expect(html).not.toContain('<b>Ana</b>');
    expect(html).toContain('href="http://localhost:5173/pedidos/1"');
    expect(texto).toBe(
      'Hola <b>Ana</b>\n\nPrimer párrafo\n\nTotal: $ 10\n\nVer pedido: http://localhost:5173/pedidos/1\n\nNota'
    );
  });
});

describe('Envío', () => {
  it('sin SMTP configurado no falla y no corta el flujo', async () => {
    const enviado = await enviarCorreo({
      para: 'ana@example.com',
      asunto: 'Prueba',
      html: '<p>Hola</p>',
      texto: 'Hola',
    });
    expect(enviado).toBe(true);
  });
});
