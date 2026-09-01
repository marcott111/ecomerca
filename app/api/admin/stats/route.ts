import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionUsuario } from "@/lib/session";

export async function GET() {
  try {
    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const dbUsuario = await prisma.usuario.findUnique({ where: { id: sesion.id } });
    if (!dbUsuario || dbUsuario.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const [totalVendedores, totalProductos, pendientes, aprobados, rechazados, totalResenas] =
      await Promise.all([
        prisma.usuario.count({ where: { rol: "vendedor" } }),
        prisma.producto.count(),
        prisma.producto.count({ where: { estado: "pendiente" } }),
        prisma.producto.count({ where: { estado: "aprobado" } }),
        prisma.producto.count({ where: { estado: "rechazado" } }),
        prisma.resena.count(),
      ]);

    return NextResponse.json({
      stats: {
        totalVendedores,
        totalProductos,
        pendientes,
        aprobados,
        rechazados,
        totalResenas,
      },
    });
  } catch (error) {
    console.error("Error en stats:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
