"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { CATEGORIAS } from "@/lib/categorias";

export default function FormPublicarProducto() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0]);
  const [ubicacion, setUbicacion] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function subirImagenes(files: FileList) {
    setCargando(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (imagenes.length >= 5) break;
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/subir-imagen", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setImagenes((prev) => [...prev, data.url]);
        } else {
          setError(data.error || "No se pudo subir una imagen.");
        }
      }
    } catch {
      setError("Error al subir las imágenes.");
    } finally {
      setCargando(false);
    }
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setSubiendo(true);
    setError(null);
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descripcion,
          precio: Number(precio),
          categoria,
          ubicacion,
          imagenes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo publicar el producto.");
        return;
      }
      setExito(true);
      setTitulo("");
      setDescripcion("");
      setPrecio("");
      setUbicacion("");
      setImagenes([]);
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <form
      onSubmit={publicar}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-bold text-foreground">Publicar un producto</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Tu producto quedará <strong>pendiente</strong> de aprobación por el administrador.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-foreground">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Canasta de verduras orgánicas"
            required
            className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-foreground">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Describe tu producto ecológico..."
            required
            className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Precio (S/)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="0.00"
            required
            className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-foreground">
            Ubicación (ciudad)
          </label>
          <input
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: Quito"
            className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />
        </div>

        {/* Imágenes */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-foreground">
            Fotos (hasta 5)
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted p-6 text-sm text-muted-foreground transition hover:border-eco-500 hover:text-eco-700">
            <Upload className="h-5 w-5" />
            {cargando ? "Subiendo..." : "Subir fotos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && subirImagenes(e.target.files)}
              disabled={cargando}
            />
          </label>

          {imagenes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imagenes.map((url, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setImagenes((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {exito && (
        <p className="mt-3 text-sm font-medium text-eco-700">
          ✔ Producto enviado a aprobación.
        </p>
      )}

      <button
        type="submit"
        disabled={subiendo}
        className="mt-5 w-full rounded-xl bg-eco-600 p-3 text-sm font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
      >
        {subiendo ? "Publicando..." : "Publicar producto"}
      </button>
    </form>
  );
}
