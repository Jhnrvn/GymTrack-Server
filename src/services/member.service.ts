// model
import { MemberModel } from "../models/member.model.js";
// types
import type { MemberDocument } from "../models/member.model.js";

// member services
export class MemberService {
  static async getAllMembers(): Promise<void> {}
  static async getMemberDetails(): Promise<void> {}
  static async addMembers(): Promise<void> {}
  static async renewMembershipPlan(): Promise<void> {}
  static async changeMembershipPlan(): Promise<void> {}
  static async updateMemberDetails(): Promise<void> {}
}
