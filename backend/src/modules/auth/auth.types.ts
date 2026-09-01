export interface LoginInput {
  email: string;
  password: string;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}