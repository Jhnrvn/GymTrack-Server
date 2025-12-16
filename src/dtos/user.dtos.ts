// create new user
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

// login user
export interface LoginUserDto {
  email: string;
  password: string;
}

// user change password
export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

// forgot password
export interface ForgotPasswordDto {
  email: string;
  code: string;
}

// reset password
export type resetPassword = ForgotPasswordDto & { password: string };
