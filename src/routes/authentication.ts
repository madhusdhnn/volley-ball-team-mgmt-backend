import { Router } from "express";
import { register, signin, signout } from "../controllers/authentication-controller";
import { commonAuthorize, requestBodyValidator } from "./authorization-middleware";

const router = Router();
const baseUrl = "/v1/vtms/auth";

router.post(`${baseUrl}/register`, requestBodyValidator, register);
router.post(`${baseUrl}/signin`, requestBodyValidator, signin);
router.post(`${baseUrl}/signout`, commonAuthorize, signout);

export default router;
