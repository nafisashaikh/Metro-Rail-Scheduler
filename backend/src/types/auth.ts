export type UserRole = 'admin' | 'supervisor' | 'employee' | 'passenger';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  username?: string;
  cardNumber?: string;
}

export interface LoginTokenPayload {
  sub: string;
  role: UserRole;
}

export interface AuthRequestBody {
  role: UserRole;
  identifier: string;
  password: string;
}
