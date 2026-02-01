import {
  ListMessageRepliesInput,
  MessageReplyResponseDTO,
  SendMessageReplyInputDTO,
} from "@/application/dto/message/messageReplyDTOs";

export interface IListMessageRepliesUseCase {
  execute(input: ListMessageRepliesInput): Promise<MessageReplyResponseDTO[]>;
}

export interface ISendMessageReplyUseCase {
  execute(input: SendMessageReplyInputDTO): Promise<MessageReplyResponseDTO>;
}
