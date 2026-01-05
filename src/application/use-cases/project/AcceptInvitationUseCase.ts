import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IInvitationRepository } from "@/application/ports/repositories/IInvitationRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import {
  AcceptInvitationDTO,
  IAcceptInvitationUseCase,
} from "@/application/ports/use-cases/project/IAcceptInvitationUseCase";
import { TYPES } from "@/config/types";
import { ProjectMembership } from "@/domain/entities/project/ProjectMembership";
import { inject, injectable } from "inversify";

@injectable()
export class AcceptInvitationUseCase implements IAcceptInvitationUseCase {
  constructor(
    @inject(TYPES.InvitationRepository)
    private invitationRepo: IInvitationRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository
  ) {}

  async execute(dto: AcceptInvitationDTO): Promise<void> {
    const { token, currentUserId } = dto;

    // 1. Find invitation by token
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation) {
      throw new BadRequestError("Invalid invitation token");
    }

    // 2. Validate state and expiration
    if (!invitation.isValid()) {
      throw new BadRequestError(
        "This invitation is no longer valid or has expired"
      );
    }

    // 3. Verify email matches current authenticated user
    const user = await this.userRepo.findById(currentUserId);
    if (!user) {
      throw new BadRequestError("Authenticated user not found");
    }
    if (user.email.toLowerCase() !== invitation.email) {
      throw new UnauthorizedError(
        "This invitation was sent to a different email address"
      );
    }

    // 4. Prevent double-acceptance
    const existingMembership = await this.membershipRepo.findByProjectAndUser(
      invitation.projectId,
      currentUserId
    );
    if (existingMembership) {
      // Still mark invitation as accepted to clean up
      invitation.accept();
      await this.invitationRepo.update(invitation);

      return;
    }

    // 5. Create membership
    const membership = new ProjectMembership({
      projectId: invitation.projectId,
      userId: currentUserId,
      role: invitation.role,
    });

    await this.membershipRepo.create(membership);

    // 6. Mark invitation as accepted
    invitation.accept();
    await this.invitationRepo.update(invitation);

    //   await this.uow.commit();
  }
}
