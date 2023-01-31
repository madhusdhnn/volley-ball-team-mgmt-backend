import { Router } from "express";
import {
  allUsers,
  createNewPlayerUnit,
  createRole,
  deletePlayerUnit,
  deleteRole,
  getPlayerUnitsMetadata,
  getRoles,
  updatePlayerUnit,
  updateRole,
} from "../controllers/admin-controller";
import { internalAdminAuthorize } from "./authorization-middleware";

const router = Router();
router.use(internalAdminAuthorize);

const baseUrl = "/v1/vtms/admin";
const playerMetadataUrl = `${baseUrl}/players/metadata`;
const rolesUrl = `${baseUrl}/roles`;

router.get(`${baseUrl}/users/all`, allUsers);

router.get(playerMetadataUrl, getPlayerUnitsMetadata);
router.post(playerMetadataUrl, createNewPlayerUnit);
router.put(playerMetadataUrl, updatePlayerUnit);
router.delete(playerMetadataUrl, deletePlayerUnit);

router.get(rolesUrl, getRoles);
router.post(rolesUrl, createRole);
router.put(rolesUrl, updateRole);
router.delete(rolesUrl, deleteRole);

export default router;
