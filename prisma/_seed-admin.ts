import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@ecomerca.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.usuario.upsert({
    where: { email },
    update: { passwordHash, rol: Rol.admin, verificado: true },
    create: {
      nombre: "Administrador",
      email,
      metodoRegistro: "email",
      passwordHash,
      verificado: true,
      rol: Rol.admin,
    },
  });

  console.log(`✔ Admin asegurado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
