import { UnAuthenticatedError } from "../errors/index.js";

export const isAdmin = (user) => {
  if (user.role === "admin") return;
  throw new UnAuthenticatedError("Not authorized to access this route.");
};

export const isAdminOrCurrentUser = (user, userId) => {
  if (user.role === "admin" || user.userId === userId) return;
  throw new UnAuthenticatedError("Not authorized to access this route.");
};
