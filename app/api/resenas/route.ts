import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionUsuario } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productoId = url.searchParams.get("productoId");
    const vendedorId = url.searchParams.get("vendedorId");

    const where: Record<string, unknown> = {};
    if (productoId) where.productoId = productoId;
    if (vendedorId) where.compradorId = vendedorId;

    const resenas = await prisma.resena.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      include: { comprador: { select: { nombre: true } } },
    });

    return NextResponse.json({
      resenas: resenas.map((r) => ({
        id: r.id,
        calificacion: r.calificacion,
        comentario: r.comentario,
        creadoEn: r.creadoEn,
        autor: r.comprador.nombre,
      })),
    });
  } catch (error) {
    console.error("Error listando reseñas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "Debes iniciar sesión para dejar una reseña" }, { status: 401 });
    }

    const dbUsuario = await prisma.usuario.findUnique({ where: { id: sesion.id } });
    if (!dbUsuario || !dbUsuario.verificado) {
      return NextResponse.json({ error: "Debes verificar tu cuenta para reseñar" }, { status: 403 });
    }

    const body = await req.json();
    const { productoId, calificacion, comentario } = body;

    if (!productoId) {
      return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
    }

    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    if (producto.vendedorId === dbUsuario.id) {
      return NextResponse.json(
        { error: "No puedes reseñar tu propio producto" },
        { status: 400 },
      );
    }

    const cal = Number(calificacion);
    if (!Number.isInteger(cal) || cal < 1 || cal > 5) {
      return NextResponse.json({ error: "Calificación inválida (1-5)" }, { status: 400 });
    }

    const existente = await prisma.resena.findUnique({
      where: { productoId_compradorId: { productoId, compradorId: dbUsuario.id } },
    });

    const resena = existente
      ? await prisma.resena.update({
          where: { id: existente.id },
          data: { calificacion: cal, comentario: comentario?.trim() || null },
        })
      : await prisma.resena.create({
          data: {
            productoId,
            compradorId: dbUsuario.id,
            calificacion: cal,
            comentario: comentario?.trim() || null,
          },
        });

    return NextResponse.json({ ok: true, resena }, { status: 201 });
  } catch (error) {
    console.error("Error creando reseña:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
