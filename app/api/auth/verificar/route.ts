import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verificarCodigo } from "@/lib/otp";
import { crearTokenSesion, AUTH_COOKIE } from "@/lib/auth";
import { COOKIE_MAX_AGE } from "@/lib/session";
import { normalizarNumero } from "@/lib/wazend";

const OTP_MAX_INTENTOS = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { metodo, contacto, codigo } = body;

    if (!codigo) {
      return NextResponse.json({ error: "El código es obligatorio" }, { status: 400 });
    }

    let contactoNormalizado: string;
    if (metodo === "email" && contacto?.includes("@")) {
      contactoNormalizado = (contacto as string).trim().toLowerCase();
    } else {
      contactoNormalizado = normalizarNumero(String(contacto || ""));
    }

    const usuario = metodo === "email" && contacto?.includes("@")
      ? await prisma.usuario.findUnique({ where: { email: contactoNormalizado } })
      : await prisma.usuario.findUnique({ where: { whatsapp: contactoNormalizado } });

    if (!usuario) {
      return NextResponse.json({ error: "No se encontró una cuenta con ese contacto" }, { status: 404 });
    }

    if (!usuario.otpHash || !usuario.otpExpiracion) {
      return NextResponse.json({ error: "Solicita un nuevo código" }, { status: 400 });
    }

    if (usuario.otpIntentos >= OTP_MAX_INTENTOS) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { otpHash: null, otpExpiracion: null },
      });
      return NextResponse.json(
        { error: "Demasiados intentos. Solicita un nuevo código." },
        { status: 429 },
      );
    }

    if (usuario.otpExpiracion < new Date()) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { otpHash: null, otpExpiracion: null },
      });
      return NextResponse.json({ error: "El código ha expirado. Solicita uno nuevo." }, { status: 400 });
    }

    const valido = await verificarCodigo(usuario.otpHash, String(codigo));

    if (!valido) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { otpIntentos: usuario.otpIntentos + 1 },
      });
      return NextResponse.json({ error: "Código incorrecto" }, { status: 400 });
    }

    // Código válido: marcar verificado, limpiar OTP, crear sesión
    const actualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { verificado: true, otpHash: null, otpExpiracion: null, otpIntentos: 0 },
    });

    const token = await crearTokenSesion({
      id: actualizado.id,
      rol: actualizado.rol,
      nombre: actualizado.nombre,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      ok: true,
      usuario: {
        id: actualizado.id,
        nombre: actualizado.nombre,
        rol: actualizado.rol,
        puedeVender: actualizado.puedeVender,
        verificado: actualizado.verificado,
      },
    });
  } catch (error) {
    console.error("Error en verificación:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
