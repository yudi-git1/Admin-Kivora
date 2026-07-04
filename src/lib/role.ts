export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

export function isAdmin() {
  return getRole() === "super_admin";
}

export function canEdit() {
  const role = getRole();
  return role === "super_admin" || role === "stock_manager";
}