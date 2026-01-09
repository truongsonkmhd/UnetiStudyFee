import { jwtDecode } from "jwt-decode";
import type { JwtClaims } from "@/types/JwtClaims";

export function decodeToken(token: string): JwtClaims | null {
  try {
    return jwtDecode<JwtClaims>(token);
  } catch (e) {
    console.error("Decode token failed:", e);
    return null;
  }
}

export function getScopesFromClaims(claims: JwtClaims | null): string[] {
  if (!claims?.scope) return [];
  return claims.scope.split(/\s+/).filter(Boolean);
}

export function hasAnyScope(claims: JwtClaims | null, allowed: string[]) {
  const scopes = new Set(getScopesFromClaims(claims));
  return allowed.some((x) => scopes.has(x));
}

export function isTokenExpired(claims: JwtClaims | null) {
  if (!claims?.exp) return true;
  return Date.now() >= claims.exp * 1000;
}
