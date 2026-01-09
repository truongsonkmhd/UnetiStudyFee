export interface JwtClaims {
  id: string | "";
  scope: string;
  fullName: string | "";
  classId: string;
  avatarUrl: string | "";
  sub: string;
  iat: number;
  exp: number;
}
