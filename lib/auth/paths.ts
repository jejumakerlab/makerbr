export function isStaffRole(role: string | null | undefined) {
  return role === "admin" || role === "staff";
}

export function safeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}
