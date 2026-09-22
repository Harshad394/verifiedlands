import { z } from "zod";
import { Role } from "@prisma/client";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(Role).optional().default(Role.BUYER).refine(
    (role) => role === Role.BUYER || role === Role.SELLER,
    { message: "Role must be either BUYER or SELLER during signup" }
  ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().optional(),
  adminSecret: z.string().min(1, "Admin secret key is required"),
});
