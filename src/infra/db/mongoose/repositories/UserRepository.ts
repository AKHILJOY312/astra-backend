// src/infrastructure/db/mongoose/repositories/UserRepository.ts
import UserModel from "../modals/UserModal";
import { User, UserProps } from "../../../../domain/entities/user/User";
import { IUserRepository } from "../../../../application/repositories/IUserRepository";

export class UserRepository implements IUserRepository {
  private toDomain(doc: any): User {
    const props: UserProps = {
      name: doc.name,
      email: doc.email,
      password: doc.password,
      isVerified: doc.isVerified ?? false,
      verificationToken: doc.verificationToken ?? null,
      verificationTokenExpires: doc.verificationTokenExpires ?? null,
      resetPasswordToken: doc.resetPasswordToken ?? null,
      resetPasswordExpires: doc.resetPasswordExpires ?? null,
    };

    const user = new User(props);
    if (doc._id) {
      user.setId(doc._id.toString()); // ← CORRECT
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).select("+password");
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).select("-password");
    return doc ? this.toDomain(doc) : null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken ?? undefined,
      verificationTokenExpires: user.verificationTokenExpires ?? undefined,
    });

    const created = this.toDomain(doc);
    created.setId(doc._id.toString()); // ← CORRECT
    return created;
  }

  async save(user: User): Promise<void> {
    if (!user.id) throw new Error("Cannot save user without id");

    await UserModel.updateOne(
      { _id: user.id },
      {
        $set: {
          isVerified: user.isVerified,
          verificationToken: user.verificationToken ?? undefined,
          verificationTokenExpires: user.verificationTokenExpires ?? undefined,
          resetPasswordToken: user.resetPasswordToken ?? undefined,
          resetPasswordExpires: user.resetPasswordExpires ?? undefined,
          password: user.password,
        },
      }
    );
  }
  //good to remove the filed in the db for verificationand etc
  //   async save(user: User): Promise<void> {
  //   if (!user.id) throw new Error("Cannot save user without id");

  //   // Convert domain entity to plain object
  //   const props = {
  //     isVerified: user.isVerified,
  //     password: user.password,
  //     verificationToken: user.verificationToken,
  //     verificationTokenExpires: user.verificationTokenExpires,
  //     resetPasswordToken: user.resetPasswordToken,
  //     resetPasswordExpires: user.resetPasswordExpires,
  //   };

  //   // Separate fields into $set and $unset automatically
  //   const $set: Record<string, any> = {};
  //   const $unset: Record<string, string> = {};

  //   Object.entries(props).forEach(([key, value]) => {
  //     if (value === null || value === undefined) {
  //       $unset[key] = ""; // remove field entirely
  //     } else {
  //       $set[key] = value;
  //     }
  //   });

  //   // Perform a single clean update
  //   await UserModel.updateOne({ _id: user.id }, { $set, $unset });
  // }
}
