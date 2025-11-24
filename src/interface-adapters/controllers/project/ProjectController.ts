// src/interfaces/http/controllers/project/ProjectController.ts
import { Request, Response } from "express";
import { CreateProjectUseCase } from "../../../application/use-cases/project/CreateProjectUseCase";
import { AddMemberToProjectUseCase } from "../../../application/use-cases/project/AddMemberToProjectUseCase";
import { z } from "zod";

export class ProjectController {
  constructor(private createProjectUseCase: CreateProjectUseCase) {}

  async createProject(req: Request, res: Response) {
    const schema = z.object({
      projectName: z.string().min(1).max(100),
      description: z.string().optional(),
      imageUrl: z.string().url().nullable().optional(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const { projectName, description, imageUrl } = result.data;
    const ownerId = req.user!.id; // from auth middleware

    try {
      const { project } = await this.createProjectUseCase.execute({
        projectName,
        description,
        imageUrl,
        ownerId,
      });

      return res.status(201).json({
        success: true,
        data: project.toJSON(),
      });
    } catch (err: any) {
      if (err.message.includes("limit")) {
        return res.status(403).json({
          error: err.message,
          upgradeRequired: true,
        });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  // Helper — you can inject UserRepository or make a service
  private async resolveUserIdByEmail(email: string): Promise<string | null> {
    // Implement via UserModel.findOne({ email })
    // Return user._id.toString() or null
    return "671d8f1a9c2b3e4f12345678"; // mock
  }
}
