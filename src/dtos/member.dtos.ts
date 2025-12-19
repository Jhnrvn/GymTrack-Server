// member dto
export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  gender: string;
  member_type: string;
  membership_plan_id: string;
  discount_rate: string | number;
}

// member dto with price
export type MemberWithPriceInfo = CreateMemberDto & { price: number };

// member dto with end date
export type MemberWithEndDate = MemberWithPriceInfo & { endDate: string };

// member dto with start date
export type CreateMemberCompleteDto = MemberWithEndDate & { profile_picture: string; password: string | null };

// omitted email
export type SanitizedCreateMemberDto = Omit<CreateMemberCompleteDto, "email"> & {
  email?: string;
  hashedPassword: string;
  password: string;
};
