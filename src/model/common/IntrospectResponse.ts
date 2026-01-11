export interface IntrospectResponse {
  valid: boolean;
  scope?: string;
  username?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  client_id?: string;
}
