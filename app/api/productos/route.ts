import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionUsuario } from "@/lib/session";

type ProductoConRel = {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: string;
  ubicacion: string | null;
  estado: string;
  motivoRechazo: string | null;
  creadoEn: Date;
  imagenes: { id: string; url: string; posicion: number }[];
  vendedor: { id: string; nombre: string };
  resenas: { calificacion: number }[];
};

function serializar(p: ProductoConRel) {
  const total = p.resenas.length;
  const promedio = total
    ? p.resenas.reduce((a, r) => a + r.calificacion, 0) / total
    : 0;
  const imagen = p.imagenes.length ? p.imagenes[0].url : null;
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
    imagen,
    imagenes: p.imagenes.sort((a, b) => a.posicion - b.posicion).map((i) => i.url),
    vendedor: { id: p.vendedor.id, nombre: p.vendedor.nombre },
    resenasCount: total,
    resenasPromedio: Math.round(promedio * 10) / 10,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = url.searchParams.get("admin") === "true";
    const mios = url.searchParams.get("mios") === "true";
    const q = url.searchParams.get("q")?.trim().toLowerCase();
    const categoria = url.searchParams.get("categoria");
    const vendedor = url.searchParams.get("vendedor");

    let sesion = null;

    if (admin || mios) {
      sesion = await getSesionUsuario();
      if (!sesion) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    const where: Record<string, unknown> = {};

    if (admin) {
      const dbUsuario = await prisma.usuario.findUnique({ where: { id: sesion!.id } });
      if (!dbUsuario || dbUsuario.rol !== "admin") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      // Sin filtro de estado: admin ve todos
    } else if (mios) {
      where.vendedorId = sesion!.id;
    } else {
      where.estado = "aprobado";
    }

    if (categoria) where.categoria = categoria;
    if (vendedor) where.vendedorId = vendedor;
    if (q) {
      where.OR = [
        { titulo: { contains: q } },
        { descripcion: { contains: q } },
      ];
    }

    const productos = await prisma.producto.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      include: {
        imagenes: true,
        vendedor: { select: { id: true, nombre: true } },
        resenas: { select: { calificacion: true } },
      },
    });

    return NextResponse.json({ productos: productos.map(serializar) });
  } catch (error) {
    console.error("Error listando productos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUsuario = await prisma.usuario.findUnique({ where: { id: sesion.id } });
    if (!dbUsuario || !dbUsuario.verificado || !dbUsuario.puedeVender) {
      return NextResponse.json(
        { error: "Debes ser un vendedor verificado para publicar" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { titulo, descripcion, precio, categoria, ubicacion, imagenes } = body;

    if (!titulo?.trim() || !descripcion?.trim()) {
      return NextResponse.json({ error: "Título y descripción son obligatorios" }, { status: 400 });
    }

    const precioNum = Number(precio);
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }

    if (!categoria?.trim()) {
      return NextResponse.json({ error: "La categoría es obligatoria" }, { status: 400 });
    }

    const imagenUrls: string[] = Array.isArray(imagenes) ? imagenes.filter(Boolean) : [];

    const producto = await prisma.producto.create({
      data: {
        vendedorId: dbUsuario.id,
        titulo: String(titulo).trim(),
        descripcion: String(descripcion).trim(),
        precio: precioNum,
        categoria: String(categoria).trim(),
        ubicacion: ubicacion?.trim() || null,
        estado: "pendiente",
        imagenes: {
          create: imagenUrls.map((url, i) => ({ url, posicion: i })),
        },
      },
      include: { imagenes: true },
    });

    return NextResponse.json({ ok: true, producto }, { status: 201 });
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
