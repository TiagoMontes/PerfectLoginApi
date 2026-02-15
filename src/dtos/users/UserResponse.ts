import { Role } from '../../entities/Role';
import { UserStatus } from '../../entities/UserStatus';
import { User } from '../../entities/User';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}
