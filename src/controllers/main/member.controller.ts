//  types
import type { Request, Response } from "express";
// dtos
// services
import { MemberService } from "../../services/member.service.js";

export class MemberController {
  // get all members
  static async getAllMembers(req: Request, res: Response): Promise<void> {
    await MemberService.getAllMembers();
  }

  // get member details
  static async getMemberDetails(req: Request, res: Response): Promise<void> {
    await MemberService.getMemberDetails();
  }

  // add members
  static async addMembers(req: Request, res: Response): Promise<void> {
    await MemberService.addMembers();
  }

  // renew membership plan
  static async renewMembershipPlan(req: Request, res: Response): Promise<void> {
    await MemberService.renewMembershipPlan();
  }

  // change membership plan
  static async changeMembershipPlan(req: Request, res: Response): Promise<void> {
    await MemberService.changeMembershipPlan();
  }

  // update member details
  static async updateMemberDetails(req: Request, res: Response): Promise<void> {
    await MemberService.updateMemberDetails();
  }
}
