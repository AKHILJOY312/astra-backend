export interface RemoveMemberDTO {
  projectId: string;
  memberId: string; // userId to remove
  requestedBy: string; // who is removing (must be manager)
}

export interface RemoveMemberResultDTO {
  message: string;
}

export interface IRemoveMemberFromProjectUseCase {
  execute(input: RemoveMemberDTO): Promise<RemoveMemberResultDTO>;
}
