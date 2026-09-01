"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BotonConvertirVendedor() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function convertir() {
    setCargando(true);
    setError(null);
    const res = await fetch("/api/auth/convertir-vendedor", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se pudo activar el rol de vendedor.");
      setCargando(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <h2 className="text-lg font-bold text-foreground">¿Quieres vender en ECOMERCA?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Activa tu rol de vendedor para empezar a publicar tus productos ecológicos.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        onClick={convertir}
        disabled={cargando}
        className="mt-4 rounded-full bg-eco-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
      >
        {cargando ? "Activando..." : "Convertirme en vendedor"}
      </button>
    </div>
  );
}
