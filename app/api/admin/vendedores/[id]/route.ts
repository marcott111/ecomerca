import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionUsuario } from "@/lib/session";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbAdmin = await prisma.usuario.findUnique({ where: { id: sesion.id } });
    if (!dbAdmin || dbAdmin.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const vendedor = await prisma.usuario.findUnique({ where: { id } });
    if (!vendedor || vendedor.rol !== "vendedor") {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });
    }

    // Las relaciones Producto/Resena/ImagenProducto usan onDelete: Cascade,
    // por lo que se eliminan automáticamente junto con el vendedor.
    await prisma.usuario.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando vendedor:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
