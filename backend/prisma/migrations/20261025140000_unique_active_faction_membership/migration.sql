CREATE UNIQUE INDEX "faction_memberships_one_active_per_user"
ON "faction_memberships" ("userId")
WHERE "isActive" = TRUE;