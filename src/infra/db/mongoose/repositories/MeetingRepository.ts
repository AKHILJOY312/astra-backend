import { IMeetingRepository } from "@/application/ports/repositories/IMeetingRepository";
import { Meeting } from "@/domain/entities/meeting/Meeting";
import { MeetingModel, toMeetingEntity } from "../models/MeetingModel";

export class MeetingRepository implements IMeetingRepository {
  async create(meeting: Meeting): Promise<Meeting> {
    const doc = new MeetingModel({
      id: meeting.id,
      code: meeting.code,
      createdBy: meeting.createdBy,
      status: meeting.status,
      maxParticipants: meeting.maxParticipants,
      participants: meeting.participants,
    });
    const saved = await doc.save();
    return toMeetingEntity(saved);
  }

  async update(meeting: Meeting): Promise<void | Meeting> {
    const saved = await MeetingModel.findByIdAndUpdate(
      meeting.id,
      {
        status: meeting.status,
        participants: meeting.participants,
        maxParticipants: meeting.maxParticipants,
      },
      { new: true },
    );

    if (!saved) {
      throw new Error("Meeting not found for update");
    }

    return toMeetingEntity(saved);
  }

  async delete(id: string): Promise<Meeting | null> {
    const doc = await MeetingModel.findByIdAndDelete(id);
    return doc ? toMeetingEntity(doc) : null;
  }

  async findById(id: string): Promise<Meeting | null> {
    const doc = await MeetingModel.findById(id);
    return doc ? toMeetingEntity(doc) : null;
  }

  async findByCode(code: string): Promise<Meeting | null> {
    const doc = await MeetingModel.findOne({ code });
    return doc ? toMeetingEntity(doc) : null;
  }

  async findActiveByCode(code: string): Promise<Meeting | null> {
    const doc = await MeetingModel.findOne({
      code,
      status: "active",
    });
    return doc ? toMeetingEntity(doc) : null;
  }

  async countActive(): Promise<number> {
    return MeetingModel.countDocuments({ status: "active" });
  }
}
