import "dotenv/config";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { hashPassword } from "../utils/password";

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@verifiedland.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";
  const adminName = process.env.ADMIN_NAME || "VerifiedLand Super Admin";

  try {
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log(`Admin user '${adminEmail}' already exists.`);
      process.exit(0);
    }

    const passwordHash = await hashPassword(adminPassword);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: adminName,
        role: Role.ADMIN,
        isVerified: true,
      },
    });

    console.log(`Admin user successfully created!`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin account:", error);
    process.exit(1);
  }
}

seedAdmin();
