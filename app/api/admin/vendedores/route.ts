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

    const vendedores = await prisma.usuario.findMany({
      where: { rol: "vendedor" },
      orderBy: { creadoEn: "desc" },
      include: {
        _count: { select: { productos: true } },
      },
    });

    return NextResponse.json({
      vendedores: vendedores.map((v) => ({
        id: v.id,
        nombre: v.nombre,
        email: v.email,
        whatsapp: v.whatsapp,
        metodoRegistro: v.metodoRegistro,
        verificado: v.verificado,
        puedeVender: v.puedeVender,
        creadoEn: v.creadoEn,
        totalProductos: v._count.productos,
      })),
    });
  } catch (error) {
    console.error("Error listando vendedores:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
