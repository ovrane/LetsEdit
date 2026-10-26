/**
 * Type Definitions for Authentication, Enterprise SSO & Developer API Keys
 */

export type UserPlan = 'Free' | 'Pro' | 'Enterprise';

export interface ApiKeyRecord {
  id: string;
  token: string;
  label: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UserSession {
  uid: string;
  email: string;
  name: string;
  photoURL?: string | null;
  plan: UserPlan;
  provider: 'password' | 'google.com' | 'saml.sso';
  teamMember?: boolean;
  requires2fa?: boolean;
  token?: string;
  apiKeys?: ApiKeyRecord[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
  turnstileToken?: string;
  code2fa?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  turnstileToken?: string;
}

export interface SSODomainResult {
  useSSO: boolean;
  domain?: string;
  idpRedirectUrl?: string;
}
