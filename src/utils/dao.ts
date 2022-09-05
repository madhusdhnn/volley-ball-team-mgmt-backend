export interface IUserDao {
  username: string;
  password: string;
  enabled: boolean;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  email_id?: string;
  role_id?: number;
  role_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IRoleDao {
  role_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserTokenDao {
  id: number;
  username: string;
  secret_key: string;
  token: string;
  last_used: Date;
}

export interface IPlayerDao {
  player_id: number;
  username: string;
  name: string;
  team_id?: number;
  team_name?: string;
  shirt_no: number;
  age?: number;
  height?: number;
  weight?: number;
  power?: number;
  speed?: number;
  location?: string;
  favourite_positions?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPlayerUnitsDao {
  id: number;
  name: string;
  value: string;
}

export interface ITeamDao {
  team_id: number;
  name: string;
  max_players: number;
  created_at: Date;
  updated_at: Date;
}
