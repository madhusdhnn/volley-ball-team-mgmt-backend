import { Router } from "express";
import { getProfile } from "../controllers/profile-controller";
import { commonAuthorize } from "./authorization-middleware";

const router = Router();

router.get("/v1/vtms/api/profile", commonAuthorize, getProfile);

export default router;
