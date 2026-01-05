export interface AcceptInvitationDTO {
  token: string;
  currentUserId: string;
}

export interface IAcceptInvitationUseCase {
  execute(dto: AcceptInvitationDTO): Promise<void>;
}
