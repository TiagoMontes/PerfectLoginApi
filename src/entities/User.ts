import { Role } from './Role';
import { UserStatus } from './UserStatus';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
