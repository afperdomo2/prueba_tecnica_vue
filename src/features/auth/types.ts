export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
