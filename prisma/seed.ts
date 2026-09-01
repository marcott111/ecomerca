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
      nombre: "Eco Maqueta",
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
    "Cartón y Papel": "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=600",
    "Plástico Reciclado": "https://images.unsplash.com/photo-1605612931168-52a3d02e6d59?w=600",
    "Madera y Maquetas": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600",
    "Vidrio Reutilizado": "https://images.unsplash.com/photo-1603206224460-a127378e27ed?w=600",
    "Textil Ecológico": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600",
    "Papelería Eco": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600",
    "Manualidades Eco": "https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=600",
    "Otros": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600",
  };

  const productosDemo = [
    { titulo: "Caja organizadora de cartón reciclado", descripcion: "Caja de cartón 100% reciclado y biodegradable, ideal para organizar tu hogar.", precio: 15.0, categoria: "Cartón y Papel", ubi: "Quito" },
    { titulo: "Maceta de plástico reciclado", descripcion: "Maceta fabricada con plástico PET reciclado, resistente y ecológica.", precio: 9.5, categoria: "Plástico Reciclado", ubi: "Guayaquil" },
    { titulo: "Maqueta de madera reforestada", descripcion: "Maqueta arquitectónica de madera proveniente de plantaciones sostenibles.", precio: 38.0, categoria: "Madera y Maquetas", ubi: "Cuenca" },
    { titulo: "Frasco de vidrio reutilizado", descripcion: "Frasco de vidrio lavado y reutilizado, perfecto para almacenar alimentos.", precio: 6.5, categoria: "Vidrio Reutilizado", ubi: "Loja" },
    { titulo: "Bolso de tela reciclada", descripcion: "Bolso resistente confeccionado con tela recolectada y reutilizada.", precio: 22.0, categoria: "Textil Ecológico", ubi: "Ambato" },
    { titulo: "Cuaderno de papel reciclado", descripcion: "Cuaderno hecho con papel 100% reciclado, encuadernado artesanalmente.", precio: 7.0, categoria: "Papelería Eco", ubi: "Quito" },
    { titulo: "Decoración artesanal con materiales eco", descripcion: "Figura decorativa hecha a mano con materiales reutilizados y naturales.", precio: 12.0, categoria: "Manualidades Eco", ubi: "Cuenca" },
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
        comentario: "Excelente producto, gran calidad y muy recomendado. ¡Perfecto para el planeta!",
      },
    });
  }

  console.log("✔ Demo cargado: 7 productos aprobados con 1 reseña cada uno");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
