import { Router } from "express";

import {
  getPublicTeamsController,
  getPublicTeamController,
  getAdminTeamsController,
  getAdminTeamController,
  createTeamController,
  updateTeamController,
  deleteTeamController,
  getAdminTeamMembersController,
  createTeamMemberController,
  updateTeamMemberController,
  deleteTeamMemberController,
} from "./teams.controller.js";

// Adjust these imports only if your existing project uses different paths.
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";

export const teamsRouter = Router();

// Public routes
teamsRouter.get("/", getPublicTeamsController);
teamsRouter.get("/:slug", getPublicTeamController);

// Admin routes
teamsRouter.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  getAdminTeamsController,
);

teamsRouter.get(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  getAdminTeamController,
);

teamsRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  createTeamController,
);

teamsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  updateTeamController,
);

teamsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  deleteTeamController,
);

teamsRouter.get(
  "/:teamId/members/admin",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  getAdminTeamMembersController,
);

teamsRouter.post(
  "/:teamId/members",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  createTeamMemberController,
);

teamsRouter.patch(
  "/members/:memberId",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  updateTeamMemberController,
);

teamsRouter.delete(
  "/members/:memberId",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  deleteTeamMemberController,
);