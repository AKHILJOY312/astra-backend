// src/presentation/controllers/AdminUserController.ts
import { Request, Response } from "express";
import { ListUsersUseCase } from "../../../application/use-cases/user/ListUserUseCase";
import { BlockUserUseCase } from "../../../application/use-cases/user/BlockUserUseCase";
import { AssignAdminRoleUseCase } from "../../../application/use-cases/user/AssingAdminRoleUseCase";
import { UpdateStatusRequestDTO } from "../../../application/dto/user/UpdateStatusDTO";
import { UpdateRoleRequestDTO } from "../../../application/dto/user/UpdateRoleRequestDTO";

export class AdminUserController {
  constructor(
    private listUsersUseCase: ListUsersUseCase,
    private blockUserUseCase: BlockUserUseCase,
    private assignAdminRoleUseCase: AssignAdminRoleUseCase
  ) {}

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      console.log("AdminUserController: listUsers called with", {
        page,
        limit,
        search,
      });
      const result = await this.listUsersUseCase.execute({
        page,
        limit,
        search,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateStatusRequestDTO;

      if (!id || (status !== "active" && status !== "blocked")) {
        res.status(400).json({ message: "Invalid user ID or status provided" });
        return;
      }

      const user = await this.blockUserUseCase.execute(id, status);
      res
        .status(200)
        .json({ message: `User status updated to ${status}`, user });
    } catch (error) {
      // Check for "User not found" error type
      res.status(404).json({ message: "User not found" });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body as UpdateRoleRequestDTO;

      if (!id || typeof isAdmin !== "boolean") {
        res.status(400).json({ message: "Invalid user ID or role provided" });
        return;
      }

      const user = await this.assignAdminRoleUseCase.execute(id, isAdmin);
      const roleName = isAdmin ? "admin" : "user";
      res
        .status(200)
        .json({ message: `User role updated to ${roleName}`, user });
    } catch (error) {
      // Check for "User not found" error type
      res.status(404).json({ message: "User not found" });
    }
  }
}
