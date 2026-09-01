"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function BotonLogout() {
  const router = useRouter();

  async function salir() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={salir}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-eco-100 hover:text-eco-800"
      title="Cerrar sesión"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Salir</span>
    </button>
  );
}
