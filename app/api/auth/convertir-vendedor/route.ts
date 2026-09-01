import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verificarTokenSesion, AUTH_COOKIE, crearTokenSesion } from "@/lib/auth";
import { COOKIE_MAX_AGE } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sesion = await verificarTokenSesion(token);
  if (!sesion) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: sesion.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (!usuario.verificado) {
    return NextResponse.json({ error: "Debes verificar tu cuenta antes de vender" }, { status: 403 });
  }

  const actualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { puedeVender: true, rol: "vendedor" },
  });

  const nuevoToken = await crearTokenSesion({
    id: actualizado.id,
    rol: actualizado.rol,
    nombre: actualizado.nombre,
  });

  cookieStore.set(AUTH_COOKIE, nuevoToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({
    ok: true,
    rol: actualizado.rol,
    puedeVender: actualizado.puedeVender,
  });
}
