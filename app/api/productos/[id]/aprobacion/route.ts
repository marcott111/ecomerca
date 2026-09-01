import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionUsuario } from "@/lib/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUsuario = await prisma.usuario.findUnique({ where: { id: sesion.id } });
    if (!dbUsuario || dbUsuario.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const accion = body?.accion;
    const motivo = typeof body?.motivo === "string" ? body.motivo.trim() : null;

    if (accion !== "aprobar" && accion !== "rechazar") {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    if (accion === "rechazar" && !motivo) {
      return NextResponse.json(
        { error: "Debes indicar un motivo para rechazar el producto" },
        { status: 400 },
      );
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        estado: accion === "aprobar" ? "aprobado" : "rechazado",
        motivoRechazo: accion === "aprobar" ? null : motivo,
      },
    });

    return NextResponse.json({ ok: true, estado: producto.estado });
  } catch (error) {
    console.error("Error en aprobación:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
