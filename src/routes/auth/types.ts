export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
}
