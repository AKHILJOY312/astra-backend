export interface IChangePasswordUseCase {
  execute(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }>;
}
