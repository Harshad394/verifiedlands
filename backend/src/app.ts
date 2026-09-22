import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import authRoutes from "./routes/auth.routes";
import landRoutes from "./routes/land.routes";
import kycRoutes from "./routes/kyc.routes";
import adminRoutes from "./routes/admin.routes";
import siteVisitRoutes from "./routes/siteVisit.routes";
import messageRoutes from "./routes/message.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lands", landRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/site-visits", siteVisitRoutes);
app.use("/api/messages", messageRoutes);

// Base Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    message: "An internal server error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

export default app;
