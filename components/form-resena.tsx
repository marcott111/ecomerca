"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  productoId: string;
};

export default function FormResena({ productoId }: Props) {
  const router = useRouter();
  const [sesion, setSesion] = useState<{
    id: string;
    nombre: string;
    verificado: boolean;
  } | null | undefined>(undefined);
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.usuario) {
          setSesion({
            id: d.usuario.id,
            nombre: d.usuario.nombre,
            verificado: d.usuario.verificado,
          });
        } else {
          setSesion(null);
        }
      })
      .catch(() => setSesion(null));
  }, []);

  if (sesion === undefined) return null;

  if (!sesion) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Deja tu reseña de este producto. Necesitas una cuenta verificada.
        </p>
        <Link
          href="/registro"
          className="mt-3 inline-block rounded-full bg-eco-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-eco-700"
        >
          Crear cuenta y verificar
        </Link>
      </div>
    );
  }

  if (!sesion.verificado) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Tu cuenta aún no está verificada. Verifícala para dejar reseñas.
        </p>
        <Link
          href="/registro"
          className="mt-3 inline-block rounded-full bg-eco-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-eco-700"
        >
          Verificar mi cuenta
        </Link>
      </div>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!calificacion) {
      setMensaje({ type: "err", text: "Selecciona una calificación (1-5 estrellas)." });
      return;
    }
    setEnviando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId, calificacion, comentario }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ type: "ok", text: "¡Gracias! Tu reseña fue publicada." });
        setComentario("");
        setCalificacion(0);
        router.refresh();
      } else {
        setMensaje({ type: "err", text: data.error || "No se pudo guardar la reseña." });
      }
    } catch {
      setMensaje({ type: "err", text: "Error de conexión." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-2 font-semibold text-foreground">
        Deja tu reseña como {sesion.nombre}
      </p>

      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setCalificacion(n)}
            aria-label={`${n} estrellas`}
          >
            <Star
              className={`h-7 w-7 transition ${
                n <= (hover || calificacion)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              }`}
            />
          </button>
        ))}
        {calificacion ? (
          <span className="ml-2 text-sm text-muted-foreground">
            {calificacion} de 5
          </span>
        ) : (
          <span className="ml-2 text-sm text-muted-foreground">Selecciona</span>
        )}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={3}
        placeholder="Cuéntanos tu experiencia con este producto..."
        className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
      />

      {mensaje && (
        <p
          className={`mt-2 text-sm ${
            mensaje.type === "ok" ? "text-eco-700" : "text-red-600"
          }`}
        >
          {mensaje.text}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-3 rounded-full bg-eco-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
      >
        {enviando ? "Publicando..." : "Publicar reseña"}
      </button>
    </form>
  );
}
