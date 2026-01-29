export interface AddCommentRequestDTO {
  taskId: string;
  projectId: string;
  message: string;
}

export interface CommentResponseDTO {
  id: string;
  taskId: string;
  projectId: string;
  author: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  message: string;
  createdAt: string;
  updatedAt: string;
}
