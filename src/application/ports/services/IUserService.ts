export interface IUserService {
  findUserIdByEmail(email: string): Promise<string | null>;
}
