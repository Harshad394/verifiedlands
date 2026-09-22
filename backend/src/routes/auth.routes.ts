import { Router } from "express";
import { signup, login, getMe, createAdmin } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/create-admin", createAdmin);
router.get("/me", authenticate, getMe);

export default router;
