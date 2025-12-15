export interface CreateUserDto {
  email: string;
  password: string;
  isAgree: boolean;
  name: {
    firstName: string;
    lastName: string;
  };
  profile_picture?: string;
  verification_token?: string;
}
