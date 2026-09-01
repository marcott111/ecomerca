import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS } from "@/lib/categorias";
import ProductoCard from "@/components/producto-card";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const categoria = params.categoria;

  const where: Record<string, unknown> = { estado: "aprobado" };
  if (categoria) where.categoria = categoria;
  if (q) {
    where.OR = [
      { titulo: { contains: q } },
      { descripcion: { contains: q } },
    ];
  }

  const productos = await prisma.producto.findMany({
    where,
    orderBy: { creadoEn: "desc" },
    take: 60,
    include: {
      imagenes: { orderBy: { posicion: "asc" } },
      vendedor: { select: { nombre: true } },
      resenas: { select: { calificacion: true } },
    },
  });

  const marcas = ["🏆 Eco", "🌿 Natural", "🍯 Miel", "🥬 Orgánico", "✨ Premium", "🌾 Granos"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Productos ecológicos <span className="text-eco-600">cerca de ti</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Compra directo al productor. Contacto por WhatsApp, sin intermediarios.
        </p>
      </div>

      {/* Búsqueda estilo Marketplace */}
      <form action="/" method="get" className="mb-5">
        <div className="relative max-w-2xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar frutas, miel, cosmética natural..."
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />
        </div>
      </form>

      {/* Filtro de categorías */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !categoria
              ? "bg-eco-600 text-white"
              : "bg-card text-muted-foreground hover:bg-eco-100 hover:text-eco-800"
          }`}
        >
          Todos
        </Link>
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat}
            href={categoria === cat ? "/" : `/?categoria=${encodeURIComponent(cat)}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              categoria === cat
                ? "bg-eco-600 text-white"
                : "bg-card text-muted-foreground hover:bg-eco-100 hover:text-eco-800"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-medium text-foreground">No encontramos productos</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Prueba con otro término de búsqueda, otra categoría, o conviértete en vendedor y
            publica el primero.
          </p>
          <Link
            href="/registro"
            className="mt-2 rounded-full bg-eco-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-eco-700"
          >
            Publicar un producto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((p, i) => (
            <ProductoCard
              key={p.id}
              id={p.id}
              titulo={p.titulo}
              precio={p.precio}
              ubicacion={p.ubicacion}
              categoria={p.categoria}
              imagen={p.imagenes[0]?.url}
              marca={marcas[i % marcas.length]}
              resenasPromedio={
                p.resenas.length
                  ? Math.round(
                      (p.resenas.reduce((a, r) => a + r.calificacion, 0) /
                        p.resenas.length) *
                        10,
                    ) / 10
                  : 0
              }
              resenasCount={p.resenas.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
