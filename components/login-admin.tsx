"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales inválidas.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={entrar}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-5 flex flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eco-100 text-eco-700">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-bold text-foreground">Panel de administración</h1>
        <p className="text-center text-sm text-muted-foreground">
          Accede con tu correo y contraseña de administrador.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ecomerca.com"
            className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={cargando}
        className="mt-5 w-full rounded-xl bg-eco-600 p-3 text-sm font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
      >
        {cargando ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
