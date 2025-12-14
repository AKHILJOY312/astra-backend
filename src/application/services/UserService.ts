import { inject, injectable } from "inversify";
import { IUserRepository } from "../ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";
@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async findUserIdByEmail(email: string): Promise<string | null> {
    const user = await this.userRepo.findByEmail(email);
    return user?.id ?? null;
  }
}
