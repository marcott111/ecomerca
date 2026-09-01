import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  MessageCircle,
  Star,
  Tag,
  User,
  Leaf,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatoMoneda } from "@/lib/formato";
import {
  normalizarNumero,
  numeroAWhatsAppLink,
} from "@/lib/wazend";
import FormResena from "@/components/form-resena";

export const dynamic = "force-dynamic";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const producto = await prisma.producto.findUnique({
    where: { id },
    include: {
      imagenes: { orderBy: { posicion: "asc" } },
      vendedor: { select: { id: true, nombre: true, whatsapp: true } },
      resenas: {
        orderBy: { creadoEn: "desc" },
        include: { comprador: { select: { nombre: true } } },
      },
    },
  });

  if (!producto || producto.estado !== "aprobado") {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Leaf className="mx-auto h-12 w-12 text-eco-300" />
        <h1 className="mt-4 text-2xl font-bold">Producto no disponible</h1>
        <p className="mt-2 text-muted-foreground">
          Este producto no existe o aún no ha sido aprobado.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-eco-600 px-5 py-2 text-sm font-semibold text-white hover:bg-eco-700"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const promedio =
    producto.resenas.length > 0
      ? Math.round(
          (producto.resenas.reduce((a, r) => a + r.calificacion, 0) /
            producto.resenas.length) *
            10,
        ) / 10
      : 0;

  const marca = ["🏆 Eco", "🌿 Natural", "🍯 Miel", "🥬 Orgánico"][
    Math.abs(id.charCodeAt(0)) % 4
  ];

  const whatsappNum = producto.vendedor.whatsapp
    ? normalizarNumero(producto.vendedor.whatsapp)
    : null;

  const mensajeCompra = `Hola, vi tu producto "${producto.titulo}" en ECOMERCA y me interesa comprarlo.`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-medium text-eco-700 hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Galería */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-eco-100">
            {producto.imagenes[0] ? (
              <Image
                src={producto.imagenes[0].url}
                alt={producto.titulo}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>
          {producto.imagenes.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {producto.imagenes.map((img, i) => (
                <div
                  key={img.id}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border"
                >
                  <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info y compra */}
        <div>
          <span className="inline-block rounded-full bg-eco-100 px-3 py-1 text-xs font-semibold text-eco-800">
            {marca}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {producto.titulo}
          </h1>

          <p className="mt-3 text-3xl font-bold text-eco-700">
            {formatoMoneda(producto.precio)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" /> {producto.categoria}
            </span>
            {producto.ubicacion && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {producto.ubicacion}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {producto.resenas.length > 0
                ? `${promedio} (${producto.resenas.length} reseñas)`
                : "Sin reseñas"}
            </span>
          </div>

          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {producto.descripcion}
          </p>

          {/* Vendedor */}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-eco-100 text-eco-700">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{producto.vendedor.nombre}</p>
              <Link
                href={`/vendedor/${producto.vendedor.id}`}
                className="text-sm text-eco-700 hover:underline"
              >
                Ver perfil y productos
              </Link>
            </div>
          </div>

          {/* Comprar por WhatsApp */}
          {whatsappNum ? (
            <a
              href={numeroAWhatsAppLink(whatsappNum, mensajeCompra)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#1fb959]"
            >
              <MessageCircle className="h-5 w-5" />
              Comprar ahora por WhatsApp
            </a>
          ) : (
            <div className="mt-6 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
              Este vendedor no tiene WhatsApp público configurado.
            </div>
          )}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Se abrirá WhatsApp para contactar directo al vendedor. Sin pagos en línea.
          </p>
        </div>
      </div>

      {/* Reseñas */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-bold text-foreground">Reseñas</h2>
          {producto.resenas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay reseñas para este producto.
            </p>
          ) : (
            <ul className="space-y-3">
              {producto.resenas.map((r) => (
                <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{r.comprador.nombre}</span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.calificacion
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                  {r.comentario && (
                    <p className="mt-2 text-sm text-foreground/80">{r.comentario}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(r.creadoEn).toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-foreground">Cuéntanos tu experiencia</h2>
          <FormResena productoId={producto.id} />
        </div>
      </div>
    </div>
  );
}
