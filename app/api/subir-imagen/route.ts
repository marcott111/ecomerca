import { NextResponse } from "next/server";
import { guardarImagen, esImagenValida } from "@/lib/subir-imagen";
import { getSesionUsuario } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const sesion = await getSesionUsuario();
    if (!sesion) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo no válido" }, { status: 400 });
    }

    if (!esImagenValida(file.type)) {
      return NextResponse.json({ error: "Tipo de imagen no soportado" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen supera los 5 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await guardarImagen(buffer, file.type);

    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
