import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarCodigo, hashCodigo } from "@/lib/otp";
import { enviarTextoWhatsApp, normalizarNumero, numeroAChatId } from "@/lib/wazend";
import { enviarCodigoEmail, smtpConfigurado } from "@/lib/mail";
import { WazendError } from "@/lib/wazend";

const OTP_EXPIRACION_MIN = 5;
const OTP_MAX_INTENTOS = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, metodo, numero, email } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    let metodoValido: "whatsapp" | "email";
    let contacto: string;

    if (metodo === "email" && email?.trim()) {
      metodoValido = "email";
      contacto = (email as string).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto)) {
        return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
      }
    } else {
      // Por defecto (y preferido): WhatsApp
      metodoValido = "whatsapp";
      contacto = normalizarNumero(numero || "");
      if (contacto.length < 7) {
        return NextResponse.json({ error: "Número de WhatsApp inválido" }, { status: 400 });
      }
    }

    const codigo = generarCodigo();
    const codigoHash = await hashCodigo(codigo);
    const expiracion = new Date(Date.now() + OTP_EXPIRACION_MIN * 60 * 1000);

    // Buscar o crear usuario por contacto
    const existing = metodoValido === "whatsapp"
      ? await prisma.usuario.findUnique({ where: { whatsapp: contacto } })
      : await prisma.usuario.findUnique({ where: { email: contacto } });

    const data = {
      nombre: nombre.trim(),
      verificado: false,
      otpHash: codigoHash,
      otpExpiracion: expiracion,
      otpIntentos: 0,
    };

    if (existing) {
      await prisma.usuario.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.usuario.create({
        data: {
          metodoRegistro: metodoValido,
          ...(metodoValido === "whatsapp" ? { whatsapp: contacto } : { email: contacto }),
          ...data,
        },
      });
    }

    // Enviar código por el método elegido
    let modoDemo = false;

    if (metodoValido === "whatsapp") {
      try {
        const chatId = numeroAChatId(contacto);
        const texto = `ECOMERCA: Tu código de verificación es ${codigo}. Expira en ${OTP_EXPIRACION_MIN} minutos. No lo compartas.`;
        await enviarTextoWhatsApp(chatId, texto);
      } catch (err) {
        if (err instanceof WazendError && err.status === 401) {
          modoDemo = true;
        } else if (err instanceof WazendError) {
          return NextResponse.json(
            { error: "No se pudo enviar el código por WhatsApp. Verifica tu sesión de Wazend." },
            { status: 502 },
          );
        } else {
          modoDemo = true;
        }
      }
    } else {
      if (!smtpConfigurado()) {
        modoDemo = true;
      } else {
        try {
          await enviarCodigoEmail(contacto, codigo);
        } catch {
          modoDemo = true;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      necesitaVerificar: true,
      metodo: metodoValido,
      contacto,
      demo: modoDemo ? codigo : undefined,
      mensajeDemo: modoDemo
        ? "No hay credenciales configuradas; se muestra el código en modo demo."
        : undefined,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
