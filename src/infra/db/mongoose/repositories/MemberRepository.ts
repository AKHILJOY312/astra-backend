import { AssignableMemberDTO } from "@/application/dto/task/taskDto";
import { IMemberRepository } from "@/application/ports/repositories/IMemberRepository ";
import { Types } from "mongoose";
import { ProjectMembershipModel } from "@/infra/db/mongoose/models/ProjectMembershipModel";

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

type MembershipWithUser = {
  userId: UserDoc | Types.ObjectId | null;
};

export class MemberRepository implements IMemberRepository {
  async searchMembersByProject(
    projectId: string,
    query: string,
  ): Promise<AssignableMemberDTO[]> {
    const regex = new RegExp(query, "i");

    const memberships = await ProjectMembershipModel.find({
      projectId,
      // isDeleted: false,
    }).populate<MembershipWithUser>({
      path: "userId",
      match: {
        $or: [{ name: regex }, { email: regex }],
      },
      select: "_id name email avatarUrl",
    });

    return memberships
      .filter(
        (m): m is typeof m & { userId: UserDoc } =>
          m.userId !== null && !(m.userId instanceof Types.ObjectId),
      )
      .map((m) => ({
        id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        avatarUrl: m.userId.avatarUrl,
      }));
  }

  async isMemberOfProject(projectId: string, userId: string): Promise<boolean> {
    const count = await ProjectMembershipModel.countDocuments({
      projectId,
      userId,
      isDeleted: false,
    });

    return count > 0;
  }
}
