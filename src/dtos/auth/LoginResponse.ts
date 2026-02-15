import { UserResponse } from '../users/UserResponse';

export interface LoginResponse {
  data: {
    token: string;
    user: UserResponse;
  };
  message: string;
}
