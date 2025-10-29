import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL!;
  const name = process.env.ADMIN_NAME || "Admin";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe!123";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, name, passwordHash, role: "ADMIN" as any },
  });

  console.log("✅ Admin ready:", email);
}

main().finally(() => prisma.$disconnect());
