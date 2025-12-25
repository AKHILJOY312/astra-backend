// src/application/ports/useCases/IAdminLogin.ts
export interface IAdminLogin {
  execute(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      isAdmin: boolean;
    };
  }>;
}
