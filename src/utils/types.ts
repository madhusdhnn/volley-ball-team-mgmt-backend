import { Request } from "express";

export interface IAudit {
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeam {
  id: number;
  name: string;
  maxPlayers: number;
  audit: IAudit;
}

export interface IAdditionalInfo {
  age: number;
  height: number;
  weight: number;
  power: number;
  speed: number;
  location: string;
  favouritePositions: string[];
}

export interface IPlayer {
  id: number;
  name: string;
  username: string;
  initials: string;
  photoUrl?: string;
  shirtNo: number;
  team: Partial<ITeam> | null;
  additionalInfo: Partial<IAdditionalInfo>;
  audit: IAudit;
}

export interface IAuthenticableRequest extends Request {
  authentication?: string;
  user?: any;
  player?: any;
  isAdmin?: boolean;
  logoutAllSessions?: boolean;
}

export interface IUserToken {
  id: number;
  username: string;
  secretKey: string;
  token: string;
  lastUsed: Date;
}

export interface IPlayerUnits {
  id: number;
  name: string;
  value: string;
}

export interface IUser {
  username: string;
  enabled: boolean;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  emailAddress?: string;
  role?: {
    id?: number;
    name?: string;
  };
  audit: IAudit;
}

export enum RoleType {
  ADMIN,
  PLAYER,
}

export interface INewTeam {
  teamName: string;
}

export interface INewUserData {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  emailAddress: string;
  role: RoleType;
}

export interface IRole {
  id: number;
  name: string;
  audit: IAudit;
}

export interface IAuthPayload {
  username: string;
  password: string;
}

export interface IAssignPlayerPayload {
  playerIds: number[];
  teamId: number;
}

export type JwtPayload = {
  username: string;
  enabled: boolean;
  firstName: string;
  lastName: string;
  fullName: string;
  role?: {
    id?: number;
    name?: string;
  };
  profileImageUrl?: string;
  emailAddress?: string;
};
