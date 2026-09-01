import { cookies } from "next/headers";
import { AUTH_COOKIE, verificarTokenSesion, type SesionUsuario } from "./auth";
import { prisma } from "./prisma";

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function getSesionUsuario(): Promise<SesionUsuario | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verificarTokenSesion(token);
}

export async function getUsuarioActual() {
  const sesion = await getSesionUsuario();
  if (!sesion) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.id },
  });
  return usuario;
}
