import Link from "next/link";
import { getSesionUsuario } from "@/lib/session";
import BotonLogout from "@/components/boton-logout";

export default async function Header() {
  const sesion = await getSesionUsuario();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[#ffffff]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-eco-700">
          <img
            src="/logo.png"
            alt="ECOMERCA"
            className="h-10 w-auto rounded-md object-contain"
          />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-eco-100 hover:text-eco-800"
          >
            Explorar
          </Link>

          {sesion ? (
            <>
              {sesion.rol === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-lg bg-eco-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-eco-700"
                >
                  Panel Admin
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-eco-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-eco-700"
                >
                  Mi panel
                </Link>
              )}
              <BotonLogout />
            </>
          ) : (
            <>
              <Link
                href="/registro"
                className="rounded-lg px-3 py-2 text-sm font-medium text-eco-700 transition hover:bg-eco-100"
              >
                Registrarme
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-eco-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-eco-700"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
