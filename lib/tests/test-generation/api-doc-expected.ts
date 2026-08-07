import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type CookieTokenRefresh = {
  access: string;
  accessExpiration: string;
};
type CookieTokenRefreshRequest = Partial<{
  refresh: string;
}>;
type JWTLogout = {
  detail: string;
};
type JWTLogoutRequest = Partial<{
  refresh: string;
}>;
type Login = {
  access: string;
  refresh: string;
  accessExpiration: string;
  refreshExpiration: string;
  user: UserDetails;
};
type UserDetails = {
  pk: number;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
};
type LoginRequest = {
  email: string;
  password: string;
};
type PaginatedSocialAccountList = {
  count: number;
  next?: (string | null) | undefined;
  previous?: (string | null) | undefined;
  results: Array<SocialAccount>;
};
type SocialAccount = {
  id: number;
  provider: string;
  uid: string;
  lastLogin: string;
  dateJoined: string;
};
type PasswordChange = {
  detail: string;
};
type PasswordChangeRequest = {
  newPassword1: string;
  newPassword2: string;
};
type PasswordReset = {
  detail: string;
};
type PasswordResetConfirm = {
  detail: string;
};
type PasswordResetConfirmRequest = {
  newPassword1: string;
  newPassword2: string;
  uid: string;
  token: string;
};
type PasswordResetRequest = {
  email: string;
};
type PatchedUserDetailsRequest = Partial<{
  firstName: string;
  lastName: string;
}>;
type Register = {
  detail: string;
};
type RegisterRequest = {
  email: string;
  password1: string;
  password2: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
};
type ResendEmailVerification = {
  detail: string;
};
type ResendEmailVerificationRequest = {
  email: string;
};
type TokenVerifyRequest = {
  token: string;
};
type UserDetailsRequest = Partial<{
  firstName: string;
  lastName: string;
}>;
type VerifyEmail = {
  detail: string;
};
type VerifyEmailRequest = {
  key: string;
};

const LoginRequest: z.ZodType<LoginRequest> = z
  .object({ email: z.string().min(1).email(), password: z.string().min(1) })
  .passthrough();
const UserDetails: z.ZodType<UserDetails> = z
  .object({
    pk: z.number().int(),
    email: z.string().email(),
    firstName: z.string().max(150).optional(),
    lastName: z.string().max(150).optional(),
  })
  .passthrough();
const Login: z.ZodType<Login> = z
  .object({
    access: z.string(),
    refresh: z.string(),
    accessExpiration: z.string().datetime({ offset: true }),
    refreshExpiration: z.string().datetime({ offset: true }),
    user: UserDetails,
  })
  .passthrough();
const JWTLogoutRequest: z.ZodType<JWTLogoutRequest> = z
  .object({ refresh: z.string().min(1) })
  .partial()
  .passthrough();
const JWTLogout: z.ZodType<JWTLogout> = z
  .object({ detail: z.string() })
  .passthrough();
const PasswordChangeRequest: z.ZodType<PasswordChangeRequest> = z
  .object({
    newPassword1: z.string().min(1).max(128),
    newPassword2: z.string().min(1).max(128),
  })
  .passthrough();
const PasswordChange: z.ZodType<PasswordChange> = z
  .object({ detail: z.string() })
  .passthrough();
const PasswordResetRequest: z.ZodType<PasswordResetRequest> = z
  .object({ email: z.string().min(1).email() })
  .passthrough();
const PasswordReset: z.ZodType<PasswordReset> = z
  .object({ detail: z.string() })
  .passthrough();
const PasswordResetConfirmRequest: z.ZodType<PasswordResetConfirmRequest> = z
  .object({
    newPassword1: z.string().min(1).max(128),
    newPassword2: z.string().min(1).max(128),
    uid: z.string().min(1),
    token: z.string().min(1),
  })
  .passthrough();
const PasswordResetConfirm: z.ZodType<PasswordResetConfirm> = z
  .object({ detail: z.string() })
  .passthrough();
const RegisterRequest: z.ZodType<RegisterRequest> = z
  .object({
    email: z.string().min(1).email(),
    password1: z.string().min(1),
    password2: z.string().min(1),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .passthrough();
const Register: z.ZodType<Register> = z
  .object({ detail: z.string() })
  .passthrough();
const ResendEmailVerificationRequest: z.ZodType<ResendEmailVerificationRequest> =
  z.object({ email: z.string().min(1).email() }).passthrough();
const ResendEmailVerification: z.ZodType<ResendEmailVerification> = z
  .object({ detail: z.string() })
  .passthrough();
const VerifyEmailRequest: z.ZodType<VerifyEmailRequest> = z
  .object({ key: z.string().min(1) })
  .passthrough();
const VerifyEmail: z.ZodType<VerifyEmail> = z
  .object({ detail: z.string() })
  .passthrough();
const SocialAccount: z.ZodType<SocialAccount> = z
  .object({
    id: z.number().int(),
    provider: z.string().max(200),
    uid: z.string().max(191),
    lastLogin: z.string().datetime({ offset: true }),
    dateJoined: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedSocialAccountList: z.ZodType<PaginatedSocialAccountList> = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(SocialAccount),
  })
  .passthrough();
const CookieTokenRefreshRequest: z.ZodType<CookieTokenRefreshRequest> = z
  .object({ refresh: z.string() })
  .partial()
  .passthrough();
const CookieTokenRefresh: z.ZodType<CookieTokenRefresh> = z
  .object({
    access: z.string(),
    accessExpiration: z.string().datetime({ offset: true }),
  })
  .passthrough();
const TokenVerifyRequest: z.ZodType<TokenVerifyRequest> = z
  .object({ token: z.string().min(1) })
  .passthrough();
const UserDetailsRequest: z.ZodType<UserDetailsRequest> = z
  .object({ firstName: z.string().max(150), lastName: z.string().max(150) })
  .partial()
  .passthrough();
const PatchedUserDetailsRequest: z.ZodType<PatchedUserDetailsRequest> = z
  .object({ firstName: z.string().max(150), lastName: z.string().max(150) })
  .partial()
  .passthrough();

export const schemas = {
  LoginRequest,
  UserDetails,
  Login,
  JWTLogoutRequest,
  JWTLogout,
  PasswordChangeRequest,
  PasswordChange,
  PasswordResetRequest,
  PasswordReset,
  PasswordResetConfirmRequest,
  PasswordResetConfirm,
  RegisterRequest,
  Register,
  ResendEmailVerificationRequest,
  ResendEmailVerification,
  VerifyEmailRequest,
  VerifyEmail,
  SocialAccount,
  PaginatedSocialAccountList,
  CookieTokenRefreshRequest,
  CookieTokenRefresh,
  TokenVerifyRequest,
  UserDetailsRequest,
  PatchedUserDetailsRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/auth/login/",
    description: `Authenticate with username/email and password to obtain access tokens. Returns user details along with JWT access and refresh tokens with expiration times. Authentication cookies are set automatically for secure token storage.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LoginRequest,
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: Login,
  },
  {
    method: "post",
    path: "/api/auth/logout/",
    description: `Logout user and invalidate authentication tokens. Blacklists JWT refresh tokens to prevent further use. Clears authentication cookies from the browser. Requires authentication to ensure only valid sessions can be logged out.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ refresh: z.string().min(1) })
          .partial()
          .passthrough(),
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/password/change/",
    description: `Change the current user&#x27;s password. Requires authentication. `,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PasswordChangeRequest,
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/password/reset/",
    description: `Send password reset instructions to the provided email address. If the email is registered, a secure reset link will be sent. The link expires after a limited time for security.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ email: z.string().min(1).email() }).passthrough(),
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/password/reset/confirm/",
    description: `Complete the password reset process using the token from the reset email. Requires the UID and token from the email along with the new password. The token is single-use and expires for security.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PasswordResetConfirmRequest,
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/registration/",
    description: `Register a new user account. Users must verify their email address before the account is fully activated.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RegisterRequest,
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/registration/resend-email/",
    description: `Send a new email verification message to unverified email addresses. Only works for email addresses that are registered but not yet verified.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ email: z.string().min(1).email() }).passthrough(),
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "get",
    path: "/api/auth/registration/verify-email/",
    description: `GET method not allowed for email verification.`,
    requestFormat: "json",
    parameters: [
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 405,
        description: `Method not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/auth/registration/verify-email/",
    description: `Confirm email address using the verification key sent via email. This activates the user account and allows login access.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ key: z.string().min(1) }).passthrough(),
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ detail: z.string() }).passthrough(),
  },
  {
    method: "get",
    path: "/api/auth/social/accounts/",
    description: `List all social accounts connected to the current user. Shows account details including provider, UID, and connection dates.`,
    requestFormat: "json",
    parameters: [
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedSocialAccountList,
  },
  {
    method: "delete",
    path: "/api/auth/social/accounts/:id/",
    description: `Disconnect a social account from the current user. Removes the social account connection and prevents future logins via that provider. Requires authentication and the account must belong to the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/auth/token/refresh/",
    description: `Generate new JWT access tokens using refresh tokens. Refresh tokens can be provided in request data or extracted automatically from HTTP cookies. Returns new access tokens with updated expiration times. New tokens are automatically set in HTTP cookies for secure storage.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ refresh: z.string() }).partial().passthrough(),
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: CookieTokenRefresh,
  },
  {
    method: "post",
    path: "/api/auth/token/verify/",
    description: `Takes a token and indicates if it is valid.  This view provides no
information about a token&#x27;s fitness for a particular use.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ token: z.string().min(1) }).passthrough(),
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/auth/user/",
    description: `Retrieve the authenticated user&#x27;s profile information including username, email, first name, and last name. Password fields are excluded.`,
    requestFormat: "json",
    parameters: [
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: UserDetails,
  },
  {
    method: "put",
    path: "/api/auth/user/",
    description: `Update the authenticated user&#x27;s profile information. Allows modification of username, first name, and last name. Email field is read-only for security.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserDetailsRequest,
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: UserDetails,
  },
  {
    method: "patch",
    path: "/api/auth/user/",
    description: `Partially update the authenticated user&#x27;s profile information. Only provided fields will be updated. Email field is read-only.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedUserDetailsRequest,
      },
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: UserDetails,
  },
  {
    method: "get",
    path: "/api/status/",
    requestFormat: "json",
    parameters: [
      {
        name: "accept-language",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
