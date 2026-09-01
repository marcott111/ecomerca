"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X, MapPin } from "lucide-react";
import { formatoMoneda } from "@/lib/formato";

type Producto = {
  id: string;
  titulo: string;
  precio: number;
  categoria: string;
  ubicacion: string | null;
  descripcion: string;
  imagen: string | null;
  vendedor: { nombre: string };
};

export default function AdminAprobador({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [rechazando, setRechazando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);

  async function decidir(id: string, accion: "aprobar" | "rechazar") {
    if (accion === "rechazar" && !motivo.trim()) {
      alert("Ingresa un motivo para rechazar.");
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`/api/productos/${id}/aprobacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, motivo: accion === "rechazar" ? motivo : null }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al procesar.");
        return;
      }
      setRechazando(null);
      setMotivo("");
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  if (productos.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No hay productos pendientes de aprobación.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {productos.map((p) => (
        <li
          key={p.id}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            {p.imagen ? (
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                <Image src={p.imagen} alt={p.titulo} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-eco-100 text-muted-foreground">
                Sin foto
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{p.titulo}</h3>
                <span className="font-bold text-eco-700">{formatoMoneda(p.precio)}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.categoria} · Vendedor: {p.vendedor.nombre}
              </p>
              {p.ubicacion && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {p.ubicacion}
                </p>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{p.descripcion}</p>
            </div>
          </div>

          {rechazando === p.id ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={2}
                placeholder="Motivo del rechazo (obligatorio)..."
                className="w-full rounded-lg border border-red-200 bg-white p-2 text-sm outline-none focus:border-red-400"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => decidir(p.id, "rechazar")}
                  disabled={cargando}
                  className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Confirmar rechazo
                </button>
                <button
                  onClick={() => {
                    setRechazando(null);
                    setMotivo("");
                  }}
                  className="rounded-lg border border-border bg-white px-4 py-1.5 text-sm font-medium text-muted-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => decidir(p.id, "aprobar")}
                disabled={cargando}
                className="flex items-center gap-1.5 rounded-lg bg-eco-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Aprobar
              </button>
              <button
                onClick={() => setRechazando(p.id)}
                disabled={cargando}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Rechazar
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
