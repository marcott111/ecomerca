import Link from "next/link";
import Image from "next/image";
import { Package, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatoMoneda } from "@/lib/formato";
import FormPublicarProducto from "@/components/form-publicar-producto";
import BotonConvertirVendedor from "@/components/boton-convertir-vendedor";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const usuario = await getUsuarioActual();

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Inicia sesión para ver tu panel</h1>
        <p className="mt-2 text-muted-foreground">
          Regístrate o verifica tu cuenta para acceder a tu panel de vendedor.
        </p>
        <Link
          href="/registro"
          className="mt-6 inline-block rounded-full bg-eco-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-eco-700"
        >
          Crear cuenta / Iniciar sesión
        </Link>
      </div>
    );
  }

  const productos = await prisma.producto.findMany({
    where: { vendedorId: usuario.id },
    orderBy: { creadoEn: "desc" },
    include: { imagenes: { orderBy: { posicion: "asc" } } },
  });

  const contador = (estado: string) =>
    productos.filter((p) => p.estado === estado).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">
        Hola, {usuario.nombre}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {usuario.puedeVender
          ? "Gestiona tus productos ecológicos."
          : "Activa tu rol de vendedor para publicar."}
      </p>

      {/* Stats */}
      {usuario.puedeVender && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-eco-700">{contador("aprobado")}</p>
            <p className="text-xs text-muted-foreground">Aprobados</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{contador("pendiente")}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{contador("rechazado")}</p>
            <p className="text-xs text-muted-foreground">Rechazados</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          {usuario.puedeVender ? (
            <FormPublicarProducto />
          ) : (
            <BotonConvertirVendedor />
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-eco-600" />
            <h2 className="text-lg font-bold text-foreground">Mis productos</h2>
          </div>

          {productos.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Aún no has publicado productos.
            </p>
          ) : (
            <ul className="space-y-3">
              {productos.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  {p.imagenes[0] ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                      <Image
                        src={p.imagenes[0].url}
                        alt={p.titulo}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-eco-100 text-eco-700">
                      <Plus className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{p.titulo}</p>
                    <p className="text-sm text-eco-700">{formatoMoneda(p.precio)}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {p.estado === "aprobado" && (
                        <span className="flex items-center gap-1 text-eco-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aprobado
                        </span>
                      )}
                      {p.estado === "pendiente" && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Clock className="h-3.5 w-3.5" /> Pendiente
                        </span>
                      )}
                      {p.estado === "rechazado" && (
                        <span className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-3.5 w-3.5" /> Rechazado
                        </span>
                      )}
                    </div>
                    {p.estado === "rechazado" && p.motivoRechazo && (
                      <p className="mt-1 text-xs text-red-600">
                        Motivo: {p.motivoRechazo}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/producto/${p.id}`}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-eco-700 transition hover:bg-eco-100"
                  >
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
