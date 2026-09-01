"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function AdminEliminarProducto({
  id,
  titulo,
}: {
  id: string;
  titulo: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function eliminar() {
    const confirmado = window.confirm(
      `¿Eliminar el producto "${titulo}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;

    setCargando(true);
    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el producto.");
      setCargando(false);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={eliminar}
      disabled={cargando}
      title="Eliminar producto"
      className="flex items-center gap-1 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Eliminar
    </button>
  );
}
