// model
import { MemberModel } from "../models/member.model.js";
// types
import type { MemberDocument } from "../models/member.model.js";
import type { CreateMemberCompleteDto, SanitizedCreateMemberDto } from "../dtos/member.dtos.js";
// utility
import { AppError } from "../utils/error.utils.js";
import { sendMemberAccountEmail } from "../utils/sendMemberAccount.utils.js";

// member services
export class MemberService {
  static async getAllMembers(): Promise<void> {}
  static async getMemberDetails(): Promise<void> {}
  static async addMembers(member: SanitizedCreateMemberDto, userId: string): Promise<void> {
    // trim first and last name
    member.firstName = member.firstName.trim();
    member.lastName = member.lastName.trim();

    // find member if already exist
    const memberExist: MemberDocument | null = await MemberModel.findOne({
      firstName: { $regex: new RegExp(`^${member.firstName}$`, "i") },
      lastName: { $regex: new RegExp(`^${member.lastName}$`, "i") },
    }).exec();
    if (memberExist) {
      throw new AppError("Oops", "Member already exists", 409);
    }

    // If email provided, check uniqueness
    if (member.email) {
      const emailExist: string = await MemberModel.findOne({ email: member.email.trim().toLowerCase() }).exec();
      if (emailExist) {
        throw new AppError("Oops", "Email already used by another member", 409);
      }
    } else {
      delete member.email;
    }

    // create new member
    const newMember: MemberDocument = new MemberModel({
      firstName: member.firstName,
      lastName: member.lastName,
      age: member.age,
      email: member.email,
      gender: member.gender,
      profile_picture: member.profile_picture,
      member_type: member.member_type,
      currentPlan: {
        plan: member.membership_plan_id,
        price: member.price,
        discount_rate: member.discount_rate,
        startDate: new Date(),
        endDate: member.endDate,
      },
    });

    // If email exists, assign password and send email
    if (member.email) {
      newMember.password = member.hashedPassword;
      await sendMemberAccountEmail(member.email, member.password);
    }

    await newMember.save();

    return;
  }
  static async renewMembershipPlan(): Promise<void> {}
  static async changeMembershipPlan(): Promise<void> {}
  static async updateMemberDetails(): Promise<void> {}
}
