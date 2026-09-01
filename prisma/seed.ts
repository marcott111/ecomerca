import { PrismaClient, Rol, EstadoProducto } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ecomerca.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  // 1. Crear o actualizar admin
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash, rol: Rol.admin },
    create: {
      nombre: "Administrador",
      email: adminEmail,
      metodoRegistro: "email",
      passwordHash: adminPasswordHash,
      verificado: true,
      rol: Rol.admin,
    },
  });
  console.log(`✔ Admin listo: ${adminEmail}`);

  // 2. Datos de ejemplo (solo si no hay productos)
  const totalProductos = await prisma.producto.count();
  if (totalProductos > 0) {
    console.log("Productos ya existen, se omite el demo.");
    return;
  }

  // Vendedor demo
  const vendedor = await prisma.usuario.upsert({
    where: { email: "vendedor@demo.com" },
    update: {},
    create: {
      nombre: "Huerta Don José",
      email: "vendedor@demo.com",
      metodoRegistro: "email",
      verificado: true,
      rol: Rol.vendedor,
      puedeVender: true,
    },
  });

  // Comprador demo
  const comprador = await prisma.usuario.upsert({
    where: { email: "comprador@demo.com" },
    update: {},
    create: {
      nombre: "María García",
      email: "comprador@demo.com",
      metodoRegistro: "email",
      verificado: true,
      rol: Rol.comprador,
    },
  });

  const categoriasImg: Record<string, string> = {
    "Frutas y Verduras": "https://images.unsplash.com/photo-1567306301406-37509d4ac64a?w=600",
    "Miel y Derivados": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600",
    "Cosmética Natural": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600",
    "Granos y Semillas": "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600",
    "Tés e Infusiones": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600",
    "Otros": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600",
  };

  const productosDemo = [
    { titulo: "Canasta de verduras orgánicas", descripcion: "Canasta semanal con verduras de temporada cultivadas sin pesticidas.", precio: 25.0, categoria: "Frutas y Verduras", ubi: "Quito" },
    { titulo: "Miel pura de abeja (500g)", descripcion: "Miel 100% natural, sin aditivos ni azúcares.", precio: 12.5, categoria: "Miel y Derivados", ubi: "Guayaquil" },
    { titulo: "Jabón artesanal de avena", descripcion: "Jabón natural con avena, ideal para piel sensible.", precio: 6.0, categoria: "Cosmética Natural", ubi: "Cuenca" },
    { titulo: "Quinua orgánica (1kg)", descripcion: "Quinua real certificada orgánica, alto en proteína.", precio: 8.0, categoria: "Granos y Semillas", ubi: "Loja" },
    { titulo: "Té de hierbas relajante", descripcion: "Mezcla de manzanilla, tilo y valeriana de cultivo ecológico.", precio: 4.5, categoria: "Tés e Infusiones", ubi: "Ambato" },
  ];

  for (const p of productosDemo) {
    const producto = await prisma.producto.create({
      data: {
        vendedorId: vendedor.id,
        titulo: p.titulo,
        descripcion: p.descripcion,
        precio: p.precio,
        categoria: p.categoria,
        ubicacion: p.ubi,
        estado: EstadoProducto.aprobado,
        imagenes: {
          create: [{ url: categoriasImg[p.categoria] || categoriasImg["Otros"], posicion: 0 }],
        },
      },
    });

    await prisma.resena.create({
      data: {
        productoId: producto.id,
        compradorId: comprador.id,
        calificacion: 5,
        comentario: "Excelente producto, calidad y sabor inmejorables. ¡Muy recomendado!",
      },
    });
  }

  console.log("✔ Demo cargado: 5 productos aprobados con 1 reseña cada uno");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
