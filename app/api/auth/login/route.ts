import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearTokenSesion, AUTH_COOKIE } from "@/lib/auth";
import { COOKIE_MAX_AGE } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son obligatorios" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: (email as string).trim().toLowerCase() },
    });

    if (!usuario || !usuario.passwordHash || usuario.rol !== "admin") {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const valida = await bcrypt.compare(password, usuario.passwordHash);
    if (!valida) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = await crearTokenSesion({
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
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
      rol: usuario.rol,
      nombre: usuario.nombre,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
