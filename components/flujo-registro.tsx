"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail, CheckCircle2 } from "lucide-react";

type Paso = "contacto" | "codigo";

export default function FlujoRegistro() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("contacto");
  const [nombre, setNombre] = useState("");
  const [metodo, setMetodo] = useState<"whatsapp" | "email">("whatsapp");
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [demoCodigo, setDemoCodigo] = useState<string | null>(null);
  const [contacto, setContacto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviarContacto(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("Ingresa tu nombre.");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, metodo, numero, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar el código.");
        return;
      }
      setContacto(data.contacto);
      setDemoCodigo(data.demo || null);
      setPaso("codigo");
    } catch {
      setError("Error de conexión.");
    } finally {
      setCargando(false);
    }
  }

  async function verificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo, contacto, codigo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código incorrecto.");
        return;
      }
      // Si el usuario quiere vender, activamos el rol vendedor
      if (quiereVender) {
        await fetch("/api/auth/convertir-vendedor", { method: "POST" });
      }
      router.push(quiereVender ? "/dashboard" : "/");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setCargando(false);
    }
  }

  const [quiereVender, setQuiereVender] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md">
      {paso === "contacto" ? (
        <form
          onSubmit={enviarContacto}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-center text-eco-700">
            <img
              src="/logo.png"
              alt="ECOMERCA"
              className="h-14 w-auto object-contain"
            />
          </div>

          <h1 className="text-center text-xl font-bold text-foreground">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Regístrate por WhatsApp (recomendado) o por correo.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Nombre
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre o nombre de tu negocio"
                className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
              />
            </div>

            {/* Selector de método */}
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Verificación por
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodo("whatsapp")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    metodo === "whatsapp"
                      ? "border-eco-600 bg-eco-600 text-white"
                      : "border-border bg-muted text-muted-foreground hover:border-eco-400"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setMetodo("email")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    metodo === "email"
                      ? "border-eco-600 bg-eco-600 text-white"
                      : "border-border bg-muted text-muted-foreground hover:border-eco-400"
                  }`}
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
              </div>
            </div>

            {metodo === "whatsapp" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Número de WhatsApp
                </label>
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ej: +52 555 123 4567"
                  inputMode="tel"
                  className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Correo electrónico
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  inputMode="email"
                  className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
                />
              </div>
            )}

            {/* Toggle vendedor */}
            <label className="flex items-center justify-between rounded-xl border border-border bg-muted p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Quiero vender</p>
                <p className="text-xs text-muted-foreground">
                  Activa tu rol de vendedor para publicar productos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuiereVender(!quiereVender)}
                className={`relative h-6 w-11 rounded-full transition ${
                  quiereVender ? "bg-eco-600" : "bg-border"
                }`}
                aria-pressed={quiereVender}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    quiereVender ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-5 w-full rounded-xl bg-eco-600 p-3 text-sm font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
          >
            {cargando ? "Enviando código..." : "Enviar código de verificación"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={verificarCodigo}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-center gap-2 text-eco-700">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eco-100">
              <CheckCircle2 className="h-6 w-6" />
            </span>
          </div>

          <h1 className="text-center text-xl font-bold text-foreground">
            Verifica tu {metodo === "whatsapp" ? "WhatsApp" : "correo"}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Te enviamos un código de 6 dígitos a <strong>{contacto}</strong>.
          </p>

          {demoCodigo && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-800">
              <strong>Modo demo:</strong> no hay credenciales de envío configuradas. Tu código
              es <span className="font-mono text-lg font-bold">{demoCodigo}</span>
            </div>
          )}

          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="••••••"
            inputMode="numeric"
            maxLength={6}
            className="mt-4 w-full rounded-xl border border-border bg-muted p-3 text-center font-mono text-2xl tracking-widest outline-none transition focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20"
          />

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-5 w-full rounded-xl bg-eco-600 p-3 text-sm font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
          >
            {cargando ? "Verificando..." : "Verificar y continuar"}
          </button>

          <button
            type="button"
            onClick={() => setPaso("contacto")}
            className="mt-3 w-full text-center text-sm text-eco-700 hover:underline"
          >
            Cambiar número o correo
          </button>
        </form>
      )}
    </div>
  );
}
