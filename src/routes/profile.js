import { Router } from "express";
import { commonAuthorize } from "./authorization";

const router = Router();

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ status: "success", data: user });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError());
  }
};

router.get("/vbms/api/v1/profile", commonAuthorize, getProfile);

export default router;
