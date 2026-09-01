import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { formatoMoneda } from "@/lib/formato";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600";

type Props = {
  id: string;
  titulo: string;
  precio: number;
  ubicacion?: string | null;
  categoria: string;
  imagen?: string | null;
  marca?: string;
  resenasPromedio?: number;
  resenasCount?: number;
};

export default function ProductoCard({
  id,
  titulo,
  precio,
  ubicacion,
  categoria,
  imagen,
  marca,
  resenasPromedio,
  resenasCount,
}: Props) {
  const marcaArte = marca
    ? marca
    : ["🏆 Eco", "🌿 Natural", "🍯 Miel", "🥬 Orgánico"][
        Math.abs(id.charCodeAt(0)) % 4
      ];

  return (
    <Link
      href={`/producto/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-eco-100">
        {imagen ? (
          <Image
            src={imagen}
            alt={titulo}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <Image
            src={FALLBACK_IMG}
            alt={titulo}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-eco-600/90 px-2.5 py-1 text-xs font-semibold text-white">
          {categoria}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-medium text-eco-700">{marcaArte}</span>
        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">
          {titulo}
        </h3>
        <p className="text-lg font-bold text-eco-700">{formatoMoneda(precio)}</p>
        {resenasCount !== undefined && resenasCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{resenasPromedio}</span>
            <span>({resenasCount})</span>
          </div>
        )}
        {ubicacion && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {ubicacion}
          </p>
        )}
      </div>
    </Link>
  );
}
