import { Request, Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { signupSchema, loginSchema, createAdminSchema } from "../validations/auth.validation";

export const signup = async (req: Request, res: Response) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { email, password, fullName, phoneNumber, role } = parseResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email or phone number already exists.",
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phoneNumber,
        role: role || Role.BUYER,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Failed to log in", error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        kycDocuments: {
          select: {
            id: true,
            documentType: true,
            documentUrl: true,
            status: true,
            rejectionReason: true,
            verifiedAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User profile not found." });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const parseResult = createAdminSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { email, password, fullName, phoneNumber, adminSecret } = parseResult.data;

    const validAdminSecret = process.env.ADMIN_SECRET;

    if (!validAdminSecret) {
      return res.status(500).json({ message: "ADMIN_SECRET is not configured." });
    }

    if (adminSecret !== validAdminSecret) {
      return res.status(403).json({ message: "Invalid admin secret key." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const passwordHash = await hashPassword(password);

    const adminUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phoneNumber,
        role: Role.ADMIN,
        isVerified: true,
      },
    });

    const token = generateToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      fullName: adminUser.fullName,
    });

    return res.status(201).json({
      message: "Admin account created successfully",
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        phoneNumber: adminUser.phoneNumber,
        role: adminUser.role,
        isVerified: adminUser.isVerified,
        createdAt: adminUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Create admin error:", error);
    return res.status(500).json({ message: "Failed to create admin user", error: error.message });
  }
};
