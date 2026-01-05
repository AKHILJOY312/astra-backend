import { ProjectMembership } from "../../../domain/entities/project/ProjectMembership";
import { IProjectRepository } from "../../ports/repositories/IProjectRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { IPlanRepository } from "../../ports/repositories/IPlanRepository";
import { IUserSubscriptionRepository } from "../../ports/repositories/IUserSubscriptionRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/application/error/AppError";
import {
  IInviteMemberToProjectUseCase,
  InviteMemberDTO,
  InviteMemberResultDTO,
} from "@/application/ports/use-cases/project/IInviteMemberToProjectUseCase";
import { IInvitationRepository } from "@/application/ports/repositories/IInvitationRepository";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { Invitation } from "@/domain/entities/project/Invitation";
import { ENV } from "@/config/env.config";

@injectable()
export class InviteMemberToProjectUseCase
  implements IInviteMemberToProjectUseCase
{
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.ProjectRepository) private projectRepo: IProjectRepository,
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository,
    @inject(TYPES.InvitationRepository)
    private invitationRepo: IInvitationRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.EmailService) private emailSvc: IEmailService
  ) {}

  async execute(input: InviteMemberDTO): Promise<InviteMemberResultDTO> {
    const {
      projectId,
      newMemberEmail: rawEmail,
      role = "member",
      requestedBy,
    } = input;
    const email = rawEmail.trim().toLocaleLowerCase();

    //Validate the requester is Manager
    const requesterMembership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );
    if (!requesterMembership || requesterMembership.role !== "manager") {
      throw new UnauthorizedError("Only project managers can add members");
    }

    //Load project and owner plan
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundError("Project");

    const ownerSub = await this.subscriptionRepo.findActiveByUserId(
      project.ownerId
    );

    const plan = await this.planRepo.findById(ownerSub?.planType || "free");
    if (!plan) throw new NotFoundError("Plan");

    // Check seat availability  (current members + pending invites).
    const currentMemberCount = await this.membershipRepo.countMembersInProject(
      projectId
    );
    const pendingInvitesCount = await this.invitationRepo.countPendingByProject(
      projectId
    );

    if (currentMemberCount + pendingInvitesCount >= plan.maxMembersPerProject) {
      throw new BadRequestError(
        `Maximum ${plan.maxMembersPerProject} members allowed. Upgrade plan to add more.`
      );
    }

    //Check if user already exits
    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser) {
      const alreadyMember = await this.membershipRepo.findByProjectAndUser(
        projectId,
        existingUser.id as string
      );
      if (alreadyMember) {
        throw new BadRequestError(
          "This user is already a member of this project"
        );
      }
      const membership = new ProjectMembership({
        projectId,
        userId: existingUser.id as string,
        role,
      });
      const savedMembership = await this.membershipRepo.create(membership);
      return { type: "added", membership: savedMembership };
    }

    const existingPendingInvite =
      await this.invitationRepo.findPendingByEmailAndProject(email, projectId);
    if (existingPendingInvite) {
      throw new BadRequestError(
        "An invitation has already been sen to this email"
      );
    }
    const expiriesAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = new Invitation({
      projectId,
      email,
      role,
      inviterId: requestedBy,
      expiresAt: expiriesAt,
    });
    await this.invitationRepo.create(invitation);
    const invitationLink = `${ENV.CLIENT_URL}/invite?token=${invitation.token}`;
    const registrationLink = `${ENV.CLIENT_URL}/register`;
    await this.emailSvc.sendProjectInvitation(
      email,
      project.projectName,
      "A team Member",
      invitationLink,
      registrationLink
    );
    return {
      type: "invited",
      invitationId: invitation.id as string,
      email: invitation.email,
    };
  }
}

//-------------------------------------------------------------------------
// @injectable()
// export class InviteMemberToProjectUseCase
//   implements IInviteMemberToProjectUseCase
// {
//   constructor(
//     @inject(TYPES.ProjectMembershipRepository)
//     private membershipRepo: IProjectMembershipRepository,
//     @inject(TYPES.ProjectRepository) private projectRepo: IProjectRepository,
//     @inject(TYPES.UserSubscriptionRepository)
//     private subscriptionRepo: IUserSubscriptionRepository,
//     @inject(TYPES.PlanRepository) private planRepo: IPlanRepository,
//     @inject (TYPES.InvitationRepository) private invitationRepo:IInvitationRepository,
//     @inject (TYPES.UserRepository) private userRepo:IUserRepository,
//     @inject (TYPES.EmailService) private emailSvc:IEmailService,

//   ) {}

//   async execute(input: AddMemberDTO): Promise<AddMemberResultDTO> {
//     const { projectId, userId, role = "member", requestedBy } = input;

//     // 1. Prevent self-add or duplicate
//     const existing = await this.membershipRepo.findByProjectAndUser(
//       projectId,
//       userId
//     );

//     if (existing) {
//       throw new BadRequestError("User is already a member of this project");
//     }

//     // 2. Check requester is manager
//     const requesterMembership = await this.membershipRepo.findByProjectAndUser(
//       projectId,
//       requestedBy
//     );
//     if (!requesterMembership || requesterMembership.role !== "manager") {
//       throw new UnauthorizedError("Only project managers can add members");
//     }

//     // 3. Count current members
//     const memberCount = await this.membershipRepo.countMembersInProject(
//       projectId
//     );

//     // 4. Get project owner to check subscription
//     const project = await this.projectRepo.findById(projectId);
//     if (!project) throw new NotFoundError("Project");

//     const ownerSub = await this.subscriptionRepo.findActiveByUserId(
//       project.ownerId
//     );
//     const plan = await this.planRepo.findById(ownerSub?.planType || "free");
//     if (!plan) throw new NotFoundError("Plan");

//     // 5. Enforce member limit
//     if (memberCount >= plan.maxMembersPerProject) {
//       throw new UnauthorizedError(
//         `Maximum ${plan.maxMembersPerProject} members allowed. Upgrade plan to add more.`
//       );
//     }

//     // 6. Create membership
//     const membership = new ProjectMembership({
//       projectId,
//       userId,
//       role,
//     });

//     const saved = await this.membershipRepo.create(membership);

//     return { membership: saved };
//   }
// }
