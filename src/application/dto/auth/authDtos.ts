export interface AuthUserLogin {
  id: string;
  name: string;
  email: string;
}
export interface LoginUserResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: AuthUserLogin;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string;
  isAdmin: true;
}
export interface AdminLoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: AdminUserDTO;
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  imageUrl?: string;
}

export interface GoogleLoginResponseDTO {
  user: AuthUserDTO;
  accessToken: string;
  refreshToken: string;
}
export interface GoogleProfile {
  id?: string;
  name?: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  isAdmin?: boolean;
}

export interface GetMeUserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface GetMeResponseDTO {
  user: GetMeUserDTO;
}
