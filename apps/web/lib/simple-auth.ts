/**
 * Compatibility layer - re-exports the real implementations from auth.ts.
 * Kept so the ~80 files importing "@/lib/simple-auth" keep working while every
 * function goes through the single bcrypt-based source of truth in auth.ts.
 */

import {
  hashPassword,
  initAuthTables,
  ensureAdminUser,
  authenticateUser,
  createSession,
  getSessionUser,
  deleteSession,
  createUser,
} from "./auth"

export const simpleHash = hashPassword
export const initTables = initAuthTables
export {
  hashPassword,
  ensureAdminUser,
  authenticateUser,
  createSession,
  getSessionUser,
  deleteSession,
  // Previously this file had its own createUser that stored the *Promise*
  // from hashPassword (missing await) instead of the bcrypt hash, so every
  // new registration got an unusable, unhashed password. Now it delegates to
  // the correct, awaited implementation.
  createUser,
}