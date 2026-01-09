import { Role } from "@/types/Auth";
import { JwtClaims } from "@/types/JwtClaims";

export function getRolesFromClaims(claims: JwtClaims | null): string[] {
  return getScopes(claims).filter((scope) => scope.startsWith("ROLE_"));
}

function getScopes(claims: JwtClaims | null): string[] {
  if (!claims?.scope) return [];
  return claims.scope.split(/\s+/).filter(Boolean);
}

export function getPermissionsFromClaims(claims: JwtClaims | null): string[] {
  return getScopes(claims).filter((scope) => !scope.startsWith("ROLE_"));
}

export function hasAnyRole(
  claims: JwtClaims | null,
  allowed?: Role[]
): boolean {
  if (!allowed || allowed.length === 0) return true; // không yêu cầu role => ai cũng thấy
  const roles = new Set(getRolesFromClaims(claims));
  return allowed.some((r) => roles.has(r));
}
