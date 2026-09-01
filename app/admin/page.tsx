import Link from "next/link";
import { Users, Package, Clock, Star } from "lucide-react";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatoMoneda } from "@/lib/formato";
import AdminAprobador from "@/components/admin-aprobador";
import AdminEliminarVendedor from "@/components/admin-eliminar-vendedor";
import AdminEliminarProducto from "@/components/admin-eliminar-producto";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const usuario = await getUsuarioActual();

  if (!usuario || usuario.rol !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">
          Esta página solo está disponible para administradores.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-eco-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-eco-700"
        >
          Iniciar sesión como admin
        </Link>
      </div>
    );
  }

  const [pendientes, vendedores, todosProductos, totalResenas] = await Promise.all([
    prisma.producto.findMany({
      where: { estado: "pendiente" },
      orderBy: { creadoEn: "asc" },
      include: {
        imagenes: { orderBy: { posicion: "asc" }, take: 1 },
        vendedor: { select: { nombre: true } },
      },
    }),
    prisma.usuario.findMany({
      where: { rol: "vendedor" },
      orderBy: { creadoEn: "desc" },
      include: { _count: { select: { productos: true } } },
    }),
    prisma.producto.findMany({
      orderBy: { creadoEn: "desc" },
      include: {
        imagenes: { orderBy: { posicion: "asc" }, take: 1 },
        vendedor: { select: { nombre: true } },
      },
    }),
    prisma.resena.count(),
  ]);

  const stateColor: Record<string, string> = {
    aprobado: "bg-eco-100 text-eco-800",
    pendiente: "bg-amber-100 text-amber-800",
    rechazado: "bg-red-100 text-red-800",
  };

  const estadoLabel: Record<string, string> = {
    aprobado: "Aprobado",
    pendiente: "Pendiente",
    rechazado: "Rechazado",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Panel de administración</h1>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-eco-700">
            <Users className="h-5 w-5" />
            <p className="text-2xl font-bold">{vendedores.length}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Vendedores</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-eco-700">
            <Package className="h-5 w-5" />
            <p className="text-2xl font-bold">{todosProductos.length}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Productos totales</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Clock className="h-5 w-5" />
            <p className="text-2xl font-bold">{pendientes.length}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Por aprobar</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-eco-700">
            <Star className="h-5 w-5" />
            <p className="text-2xl font-bold">{totalResenas}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Reseñas</p>
        </div>
      </div>

      {/* Aprobador */}
      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Clock className="h-5 w-5 text-amber-500" />
          Aprobador de productos nuevos
        </h2>
        <AdminAprobador
          productos={pendientes.map((p) => ({
            id: p.id,
            titulo: p.titulo,
            precio: p.precio,
            categoria: p.categoria,
            ubicacion: p.ubicacion,
            descripcion: p.descripcion,
            imagen: p.imagenes[0]?.url ?? null,
            vendedor: { nombre: p.vendedor.nombre },
          }))}
        />
      </section>

      {/* Vendedores */}
      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Users className="h-5 w-5 text-eco-600" />
          Vendedores registrados
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Verificado</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((v) => (
                <tr key={v.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{v.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.whatsapp || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        v.verificado ? "bg-eco-100 text-eco-800" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v.verificado ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v._count.productos}</td>
                  <td className="px-4 py-3">
                    <AdminEliminarVendedor id={v.id} nombre={v.nombre} />
                  </td>
                </tr>
              ))}
              {vendedores.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    Aún no hay vendedores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Todos los productos */}
      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Package className="h-5 w-5 text-eco-600" />
          Todos los productos
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {todosProductos.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="px-4 py-3">
                    <Link href={`/producto/${p.id}`} className="font-medium text-eco-700 hover:underline">
                      {p.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.vendedor.nombre}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {formatoMoneda(p.precio)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        stateColor[p.estado] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {estadoLabel[p.estado] || p.estado}
                    </span>
                    {p.estado === "rechazado" && p.motivoRechazo && (
                      <p className="mt-1 text-xs text-red-500">{p.motivoRechazo}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <AdminEliminarProducto id={p.id} titulo={p.titulo} />
                  </td>
                </tr>
              ))}
              {todosProductos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No hay productos publicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
