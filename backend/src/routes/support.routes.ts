import { Router } from "express";
import { submitSupportRequest } from "../controllers/support.controller.js";

const router = Router();

router.post("/", submitSupportRequest);

export default router;
