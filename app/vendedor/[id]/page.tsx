import Link from "next/link";
import { User, Star, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductoCard from "@/components/producto-card";

export const dynamic = "force-dynamic";

export default async function VendedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendedor = await prisma.usuario.findUnique({
    where: { id },
    include: {
      productos: {
        where: { estado: "aprobado" },
        orderBy: { creadoEn: "desc" },
        include: {
          imagenes: { orderBy: { posicion: "asc" } },
          resenas: { select: { calificacion: true } },
        },
      },
    },
  });

  if (!vendedor) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Vendedor no encontrado</h1>
        <Link href="/" className="mt-4 inline-block text-eco-700 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const todasResenas = vendedor.productos.flatMap((p) => p.resenas);
  const promedio =
    todasResenas.length > 0
      ? Math.round(
          (todasResenas.reduce((a, r) => a + r.calificacion, 0) /
            todasResenas.length) *
            10,
        ) / 10
      : 0;

  const marcas = ["🏆 Eco", "🌿 Natural", "🍯 Miel", "🥬 Orgánico", "✨ Premium", "🌾 Granos"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/" className="mb-6 inline-block text-sm font-medium text-eco-700 hover:underline">
        ← Volver
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-eco-100 text-eco-700">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{vendedor.nombre}</h1>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {vendedor.productos.length} productos
              </span>
              {todasResenas.length > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {promedio} ({todasResenas.length} reseñas)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 mb-4 text-xl font-bold text-foreground">Productos</h2>

      {vendedor.productos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Este vendedor aún no tiene productos publicados.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {vendedor.productos.map((p, i) => (
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
