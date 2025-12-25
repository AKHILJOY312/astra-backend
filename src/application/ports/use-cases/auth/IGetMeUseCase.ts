// src/application/ports/useCases/IGetMe.ts

export interface IGetMe {
  execute(userId: string): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    };
  }>;
}
