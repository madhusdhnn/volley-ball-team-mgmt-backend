import { Request, Response, Router } from "express";
import RoleService from "../services/role-service";
import { InvalidStateError } from "../utils/error-utils";
import { toError } from "../utils/response-utils";
import { internalAdminAuthorize } from "./authorization";

const router = Router();
const baseUrl = "/vtms/admin/v1";

const roleService = new RoleService();

const createRole = async (req: Request, res: Response) => {
  try {
    const role = await roleService.createRole(req.body.name);
    res.status(201).json({ status: "success", data: role });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const updateRole = async (req: Request, res: Response) => {
  try {
    await roleService.updateRole(req.body.id, req.body.name);
    res.status(200).json({ status: "success" });
  } catch (e) {
    if (e instanceof InvalidStateError) {
      res.status(400).json(toError(e, "INTERNAL_ADMIN_ERR_400"));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const deleteRole = async (req: Request, res: Response) => {
  try {
    const roleName = req.query["roleName"];
    await roleService.deleteRole(roleName as string);
    res.status(200).json({ status: "success" });
  } catch (e) {
    if (e instanceof InvalidStateError) {
      res.status(400).json(toError(e, "INTERNAL_ADMIN_ERR_400"));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const getRoles = async (_req: Request, res: Response) => {
  try {
    const role = await roleService.getRoles();
    res.status(200).json({ status: "success", data: role });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

router.get(`${baseUrl}/roles`, internalAdminAuthorize, getRoles);
router.post(`${baseUrl}/roles`, internalAdminAuthorize, createRole);
router.put(`${baseUrl}/roles`, internalAdminAuthorize, updateRole);
router.delete(`${baseUrl}/roles`, internalAdminAuthorize, deleteRole);

export default router;
