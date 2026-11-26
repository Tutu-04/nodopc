import nodemailer from 'nodemailer';
import { config } from '../config.js';

let transporte;

function obtenerTransporte() {
  if (!transporte) {
    const { host, puerto, usuario, password } = config.correo;
    transporte = host
      ? nodemailer.createTransport({
          host,
          port: puerto,
          secure: puerto === 465,
          auth: usuario ? { user: usuario, pass: password } : undefined,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        })
      : nodemailer.createTransport({ jsonTransport: true });
  }
  return transporte;
}

export async function enviarCorreo({ para, asunto, html, texto }) {
  try {
    await obtenerTransporte().sendMail({ from: config.correo.remitente, to: para, subject: asunto, html, text: texto });

    if (!config.correo.host && config.correo.mostrarEnConsola) {
      console.info(`\n--- Correo (sin SMTP configurado) ---\nPara: ${para}\nAsunto: ${asunto}\n\n${texto}\n---\n`);
    }
    return true;
  } catch (error) {
    console.error(`No se pudo enviar el correo "${asunto}" a ${para}:`, error.message);
    return false;
  }
}
