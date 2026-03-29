import express from "express";
import { getMe } from "../controllers/auth.controller.js";
const router = express.Router();
router.get("/me", getMe);
export default router;
