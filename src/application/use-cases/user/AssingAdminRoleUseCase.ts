// src/application/usecases/AssignAdminRoleUseCase.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";
import { NotFoundError } from "@/application/error/AppError";
import {
  AdminRoleResponseDTO,
  IAssignAdminRoleUseCase,
} from "@/application/ports/use-cases/user/IAssignAdminRoleUseCase";

@injectable()
export class AssignAdminRoleUseCase implements IAssignAdminRoleUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(userId: string): Promise<AdminRoleResponseDTO> {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User");
    const isAdmin = user.isAdmin;
    // 1. Update the role on the User entity
    // console.log("user before setting the role : ", user);
    user.setAdminRole(!isAdmin);
    // console.log("user after setting the role : ", user);
    // 2. Persist the change
    await this.userRepo.updateRole(user.id!); // Use existing save/updateRole (if created)

    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }
}
