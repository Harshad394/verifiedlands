import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/express";

const JWT_EXPIRES_IN = "7d";
const DEVELOPMENT_JWT_SECRET = "verifiedland_development_jwt_secret";

const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production.");
  }

  return DEVELOPMENT_JWT_SECRET;
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};
