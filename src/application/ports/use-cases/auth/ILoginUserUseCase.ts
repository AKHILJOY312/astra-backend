export interface ILoginUser {
  execute(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; email: string };
  }>;
}
