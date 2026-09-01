import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "ecomerca-dev-secret-change-me",
);
const AUTH_COOKIE = "ecomerca_session";

export type SesionUsuario = {
  id: string;
  rol: string;
  nombre: string;
};

export async function crearTokenSesion(usuario: {
  id: string;
  rol: string;
  nombre: string;
}): Promise<string> {
  return new SignJWT({
    rol: usuario.rol,
    nombre: usuario.nombre,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verificarTokenSesion(token: string): Promise<SesionUsuario | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      rol: typeof payload.rol === "string" ? payload.rol : "",
      nombre: typeof payload.nombre === "string" ? payload.nombre : "",
    };
  } catch {
    return null;
  }
}

export { AUTH_COOKIE };
