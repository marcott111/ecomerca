import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";

export async function GET() {
  const usuario = await getUsuarioActual();
  if (!usuario) {
    return NextResponse.json({ usuario: null });
  }
  return NextResponse.json({
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      email: usuario.email,
      whatsapp: usuario.whatsapp,
      verificado: usuario.verificado,
      puedeVender: usuario.puedeVender,
    },
  });
}
