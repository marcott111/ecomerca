import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionUsuario } from "@/lib/session";

function serializar(p: any) {
  const total = p.resenas.length;
  const promedio = total
    ? p.resenas.reduce((a: number, r: any) => a + r.calificacion, 0) / total
    : 0;
  return {
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    precio: p.precio,
    categoria: p.categoria,
    ubicacion: p.ubicacion,
    estado: p.estado,
    motivoRechazo: p.motivoRechazo,
    creadoEn: p.creadoEn,
    imagenes: p.imagenes.sort((a: any, b: any) => a.posicion - b.posicion).map((i: any) => i.url),
    vendedor: {
      id: p.vendedor.id,
      nombre: p.vendedor.nombre,
      whatsapp: p.vendedor.whatsapp,
    },
    resenasCount: total,
    resenasPromedio: Math.round(promedio * 10) / 10,
  };
}

const include = {
  imagenes: true,
  vendedor: { select: { id: true, nombre: true, whatsapp: true } },
  resenas: { select: { calificacion: true } },
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const producto = await prisma.producto.findUnique({
      where: { id },
      include,
    });

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // El detalle público solo muestra aprobados (salvo admin/dueño)
    if (producto.estado !== "aprobado") {
      const sesion = await getSesionUsuario();
      const esAdminODueno =
        sesion &&
        (sesion.rol === "admin" || producto.vendedorId === sesion.id);
      if (!esAdminODueno) {
        return NextResponse.json({ error: "Producto no disponible" }, { status: 404 });
      }
    }

    return NextResponse.json({ producto: serializar(producto) });
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUsuario = await prisma.usuario.findUnique({ where: { id: sesion.id } });
    const producto = await prisma.producto.findUnique({ where: { id }, include: { imagenes: true } });

    if (!producto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const esAdmin = dbUsuario?.rol === "admin";
    const esDueno = producto.vendedorId === sesion.id;
    if (!esAdmin && !esDueno) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Si no es admin y el producto ya fue aprobado o está bajo revisión, no permite editar estado
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.titulo === "string") data.titulo = body.titulo.trim();
    if (typeof body.descripcion === "string") data.descripcion = body.descripcion.trim();
    if (body.precio !== undefined) {
      const n = Number(body.precio);
      if (Number.isFinite(n) && n >= 0) data.precio = n;
    }
    if (typeof body.categoria === "string") data.categoria = body.categoria.trim();
    if (typeof body.ubicacion === "string") data.ubicacion = body.ubicacion.trim() || null;

    // Editar imágenes: si se envían, reemplazar
    if (Array.isArray(body.imagenes)) {
      const urls: string[] = body.imagenes.filter(Boolean);
      const existentes = urls.filter((u) => !u.startsWith("/uploads/", 0) || u);
      await prisma.imagenProducto.deleteMany({ where: { productoId: id } });
      await prisma.imagenProducto.createMany({
        data: existentes.map((u, i) => ({ productoId: id, url: u, posicion: i })),
      });
    }

    const actualizado = await prisma.producto.update({
      where: { id },
      data,
      include,
    });

    return NextResponse.json({ producto: serializar(actualizado) });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUsuario = await prisma.usuario.findUnique({ where: { id: sesion.id } });
    const producto = await prisma.producto.findUnique({ where: { id } });

    if (!producto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const esAdmin = dbUsuario?.rol === "admin";
    const esDueno = producto.vendedorId === sesion.id;
    if (!esAdmin && !esDueno) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.producto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
