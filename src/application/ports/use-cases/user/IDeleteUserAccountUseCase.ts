export interface IDeleteUserAccountUseCase {
  execute(userId: string): Promise<void>;
}
