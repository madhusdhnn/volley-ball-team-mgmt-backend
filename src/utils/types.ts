import { Request } from "express";

export interface Audit {
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: number;
  name: string;
  maxPlayers: number;
  audit: Audit;
}

export interface AdditionalInfo {
  age: number;
  height: number;
  weight: number;
  power: number;
  speed: number;
  location: string;
  favouritePositions: string[];
}

export interface Player {
  id: number;
  name: string;
  username: string;
  initials: string;
  photoUrl?: string;
  shirtNo: number;
  team: Partial<Team> | null;
  additionalInfo: Partial<AdditionalInfo>;
  audit: Audit;
}

export interface AuthenticableRequest extends Request {
  authentication?: string;
  user?: any;
  player?: any;
  isAdmin?: boolean;
  logoutAllSessions?: boolean;
}

export interface UserToken {
  id: number;
  username: string;
  secretKey: string;
  token: string;
  lastUsed: Date;
}

export interface PlayerUnits {
  id: number;
  name: string;
  value: string;
}

export interface User {
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
  audit: Audit;
}

export enum RoleType {
  ADMIN,
  PLAYER,
}

export interface NewTeam {
  teamName: string;
}

export interface NewUserData {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  emailAddress: string;
  role: RoleType;
}

export interface Role {
  id: number;
  name: string;
  audit: Audit;
}

export interface AuthPayload {
  username: string;
  password: string;
}

export interface AssignPlayerPayload {
  playerIds: number[];
  teamId: number;
}
