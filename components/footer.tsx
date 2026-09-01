import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[#ffffff]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf className="h-4 w-4 text-eco-600" />
          <span>
            © {new Date().getFullYear()} ECOMERCA · Productos ecológicos cercanos a ti
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-eco-700">
            Explorar
          </Link>
          <Link href="/registro" className="hover:text-eco-700">
            Vender
          </Link>
          <Link href="/login" className="hover:text-eco-700">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}
