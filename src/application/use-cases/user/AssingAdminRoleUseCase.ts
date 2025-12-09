// src/application/usecases/AssignAdminRoleUseCase.ts
import { IUserRepository } from "../../repositories/IUserRepository";

export class AssignAdminRoleUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userId: string, isAdmin: boolean) {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new Error("User not found");

    // 1. Update the role on the User entity
    user.setAdminRole(isAdmin);

    // 2. Persist the change
    await this.userRepo.save(user); // Use existing save/updateRole (if created)

    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }
}
