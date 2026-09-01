import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST || "";
const PORT = Number(process.env.SMTP_PORT || "587");
const USER = process.env.SMTP_USER || "";
const PASS = process.env.SMTP_PASS || "";
const FROM = process.env.EMAIL_FROM || "ECOMERCA <no-reply@ecomerca.com>";

export function smtpConfigurado(): boolean {
  return Boolean(HOST && USER && PASS);
}

/**
 * Envía un correo con el código de verificación.
 * @returns true si se envió correctamente
 */
export async function enviarCodigoEmail(
  destino: string,
  codigo: string,
): Promise<boolean> {
  if (!smtpConfigurado()) {
    throw new Error("SMTP no configurado");
  }

  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });

  await transporter.sendMail({
    from: FROM,
    to: destino,
    subject: "ECOMERCA - Tu código de verificación",
    text: `Hola,\n\nTu código de verificación de ECOMERCA es: ${codigo}\n\nEste código expira en 5 minutos.\n\nEl equipo de ECOMERCA`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#16a34a">ECOMERCA</h2>
      <p>Tu código de verificación es:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#16a34a">${codigo}</p>
      <p>Este código expira en 5 minutos.</p>
      <hr/>
      <p style="color:#777;font-size:12px">El equipo de ECOMERCA</p>
    </div>`,
  });

  return true;
}
