import { ContainerModule } from "inversify";
import { TYPES } from "../types"; // Adjust path if needed

// Repositories
import { UserRepository } from "@/infra/db/mongoose/repositories/UserRepository";
import { PlanRepository } from "@/infra/db/mongoose/repositories/PlanRepository";
import { ProjectRepository } from "@/infra/db/mongoose/repositories/ProjectRepository";
import { ProjectMembershipRepository } from "@/infra/db/mongoose/repositories/ProjectMembershipRepository";
import { ChannelRepository } from "@/infra/db/mongoose/repositories/ChannelRepository";
import { UserSubscriptionRepository } from "@/infra/db/mongoose/repositories/UserSubscriptionRepository";
import { MessageRepository } from "@/infra/db/mongoose/repositories/MessageRepository";
import { EmailChangeOtpRepository } from "@/infra/db/mongoose/repositories/EmailChangeOtpRepository";
import { InvitationRepository } from "@/infra/db/mongoose/repositories/InvitationRepository";
import { PaymentRepository } from "@/infra/db/mongoose/repositories/PaymentRepository";
import { CounterRepository } from "@/infra/db/mongoose/repositories/CounterRepository";
// Services
import { JwtAuthService } from "@/infra/auth/JwtAuthService";
import { NodemailerEmailService } from "@/infra/email/NodemailerEmailService";
import { UserService } from "@/application/services/UserService";
import { RazorpayService } from "@/infra/payment/RazorpayService";
import { MongoTokenBlacklistService } from "@/infra/services/MongoTokenBlacklistService";
import { S3FileUploadService } from "@/infra/services/S3FileUploadService";

// Ports
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { IProjectRepository } from "@/application/ports/repositories/IProjectRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IChannelRepository } from "@/application/ports/repositories/IChannelRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { IEmailChangeOtpRepository } from "@/application/ports/repositories/IEmailChangeOtpRepository";
import { IInvitationRepository } from "@/application/ports/repositories/IInvitationRepository";
import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";

import { IUserService } from "@/application/ports/services/IUserService";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { IRazorpayService } from "@/application/ports/services/IRazorpayService";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";
import { ICounterRepository } from "@/application/ports/repositories/ICounterRepository";
import { IPdfInvoiceService } from "@/application/ports/services/IPdfInvoiceService";
import { PdfKitInvoiceGenerator } from "@/infra/services/PdfKitInvoiceGenerator";
import { IAttachmentRepository } from "@/application/ports/repositories/IAttachmentRepository";
import { AttachmentRepository } from "@/infra/db/mongoose/repositories/AttachmentRepository";
import { ITaskRepository } from "@/application/ports/repositories/ITaskRepository";
import { TaskRepository } from "@/infra/db/mongoose/repositories/TaskRepository";
import { IMemberRepository } from "@/application/ports/repositories/IMemberRepository ";
import { MemberRepository } from "@/infra/db/mongoose/repositories/MemberRepository";
import { ITaskAttachmentRepository } from "@/application/ports/repositories/ITaskAttachmentRepository";
import { TaskAttachmentRepository } from "@/infra/db/mongoose/repositories/TaskAttachmentRepository";
import { IMeetingRepository } from "@/application/ports/repositories/IMeetingRepository";
import { MeetingRepository } from "@/infra/db/mongoose/repositories/MeetingRepository";
import { ICommentRepository } from "@/application/ports/repositories/ICommentRepository";
import { CommentRepository } from "@/infra/db/mongoose/repositories/CommandRepository";
import { IMeetingService } from "@/application/ports/services/IMeetingService";
import { LiveKitMeetingService } from "@/infra/services/LiveKitMeetingService";

export const coreModule = new ContainerModule((options) => {
  //=================================================
  // Repositories (singletons)
  //=================================================
  options
    .bind<IUserRepository>(TYPES.UserRepository)
    .to(UserRepository)
    .inSingletonScope();
  options
    .bind<IPlanRepository>(TYPES.PlanRepository)
    .to(PlanRepository)
    .inSingletonScope();
  options
    .bind<IProjectRepository>(TYPES.ProjectRepository)
    .to(ProjectRepository)
    .inSingletonScope();
  options
    .bind<IProjectMembershipRepository>(TYPES.ProjectMembershipRepository)
    .to(ProjectMembershipRepository)
    .inSingletonScope();
  options
    .bind<IChannelRepository>(TYPES.ChannelRepository)
    .to(ChannelRepository)
    .inSingletonScope();
  options
    .bind<IUserSubscriptionRepository>(TYPES.UserSubscriptionRepository)
    .to(UserSubscriptionRepository)
    .inSingletonScope();
  options
    .bind<IMessageRepository>(TYPES.MessageRepository)
    .to(MessageRepository)
    .inSingletonScope();
  options
    .bind<IEmailChangeOtpRepository>(TYPES.EmailChangeOtpRepository)
    .to(EmailChangeOtpRepository)
    .inSingletonScope();
  options
    .bind<IInvitationRepository>(TYPES.InvitationRepository)
    .to(InvitationRepository)
    .inSingletonScope();
  options
    .bind<IPaymentRepository>(TYPES.PaymentRepository)
    .to(PaymentRepository)
    .inSingletonScope();
  options
    .bind<ICounterRepository>(TYPES.CounterRepository)
    .to(CounterRepository)
    .inSingletonScope();
  options
    .bind<IAttachmentRepository>(TYPES.AttachmentRepository)
    .to(AttachmentRepository)
    .inSingletonScope();
  options
    .bind<ITaskRepository>(TYPES.TaskRepository)
    .to(TaskRepository)
    .inSingletonScope();
  options
    .bind<IMemberRepository>(TYPES.MemberRepository)
    .to(MemberRepository)
    .inSingletonScope();
  options
    .bind<ITaskAttachmentRepository>(TYPES.TaskAttachmentRepository)
    .to(TaskAttachmentRepository)
    .inSingletonScope();
  options
    .bind<IMeetingRepository>(TYPES.MeetingRepository)
    .to(MeetingRepository)
    .inSingletonScope();
  options
    .bind<ICommentRepository>(TYPES.CommentRepository)
    .to(CommentRepository)
    .inSingletonScope();

  //=================================================
  // Services (singletons)
  //=================================================
  options
    .bind<IUserService>(TYPES.UserService)
    .to(UserService)
    .inSingletonScope();
  options
    .bind<IAuthService>(TYPES.AuthService)
    .to(JwtAuthService)
    .inSingletonScope();
  options
    .bind<IEmailService>(TYPES.EmailService)
    .to(NodemailerEmailService)
    .inSingletonScope();
  options
    .bind<IRazorpayService>(TYPES.PaymentService)
    .to(RazorpayService)
    .inSingletonScope();
  options
    .bind<ITokenBlacklistService>(TYPES.TokenBlacklistService)
    .to(MongoTokenBlacklistService)
    .inSingletonScope();
  options
    .bind<IFileUploadService>(TYPES.FileUploadService)
    .to(S3FileUploadService)
    .inSingletonScope();
  options
    .bind<IPdfInvoiceService>(TYPES.PdfInvoiceService)
    .to(PdfKitInvoiceGenerator)
    .inSingletonScope();
  options
    .bind<IMeetingService>(TYPES.MeetingService)
    .to(LiveKitMeetingService)
    .inSingletonScope();
});
