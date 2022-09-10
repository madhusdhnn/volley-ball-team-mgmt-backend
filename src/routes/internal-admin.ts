import { Request, Response, Router } from "express";
import PlayerService from "../services/player-service";
import RoleService from "../services/role-service";
import { InvalidStateError } from "../utils/error-utils";
import { toError } from "../utils/response-utils";
import { IPlayerUnits } from "../utils/types";
import { internalAdminAuthorize } from "./authorization";

const router = Router();
router.use(internalAdminAuthorize);

const baseUrl = "/vtms/internal-admin/v1";

const roleService = new RoleService();
const playerService = new PlayerService();

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

const getPlayerUnitsMetadata = async (_req: Request, res: Response) => {
  try {
    const playerUnits = await playerService.getPlayerUnits();
    res.json({ status: "success", data: playerUnits });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const createNewPlayerUnit = async (req: Request, res: Response) => {
  try {
    const newPlayerUnit = await playerService.createPlayerUnit(req.body);
    res.status(201).json({ status: "success", data: newPlayerUnit });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const updatePlayerUnit = async (req: Request, res: Response) => {
  try {
    await playerService.updatePlayerUnit(req.body as IPlayerUnits);
    res.status(200).json({ status: "success" });
  } catch (e) {
    if (e instanceof InvalidStateError) {
      res.status(400).json(toError(e, "INTERNAL_ADMIN_ERR_400"));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const deletePlayerUnit = async (req: Request, res: Response) => {
  try {
    const name = req.query["name"];
    await playerService.deletePlayerUnit(name as string);
    res.status(200).json({ status: "success" });
  } catch (e) {
    if (e instanceof InvalidStateError) {
      res.status(400).json(toError(e, "INTERNAL_ADMIN_ERR_400"));
      return;
    }
    res.status(500).json(toError(e));
  }
};

router.get(`${baseUrl}/players/metadata`, getPlayerUnitsMetadata);
router.post(`${baseUrl}/players/metadata`, createNewPlayerUnit);
router.put(`${baseUrl}/players/metadata`, updatePlayerUnit);
router.delete(`${baseUrl}/players/metadata`, deletePlayerUnit);

router.get(`${baseUrl}/roles`, getRoles);
router.post(`${baseUrl}/roles`, createRole);
router.put(`${baseUrl}/roles`, updateRole);
router.delete(`${baseUrl}/roles`, deleteRole);

export default router;
