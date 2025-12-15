export interface ProjectMemberView {
  id: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
