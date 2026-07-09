import { Router, type IRouter, type Response } from "express";
import { db, savedLooksTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { tryverseAuth, type AuthedRequest } from "../middlewares/tryverseAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.use("/saved-looks", tryverseAuth);

type LookPayload = {
  id: string;
  createdAt: number;
  favorite?: boolean;
  [key: string]: unknown;
};

function isValidLook(look: unknown): look is LookPayload {
  if (!look || typeof look !== "object") return false;
  const l = look as Record<string, unknown>;
  return typeof l.id === "string" && l.id.length > 0 && typeof l.createdAt === "number";
}

function rowToLook(row: typeof savedLooksTable.$inferSelect): unknown {
  const data = row.data as Record<string, unknown>;
  return { ...data, id: row.lookId, favorite: row.favorite, createdAt: row.createdAt };
}

router.get("/saved-looks", async (req: AuthedRequest, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(savedLooksTable)
      .where(eq(savedLooksTable.userId, req.tryverseUserId!))
      .orderBy(desc(savedLooksTable.createdAt));
    res.json({ looks: rows.map(rowToLook) });
  } catch (err) {
    logger.error({ err }, "Failed to list saved looks");
    res.status(500).json({ error: "Failed to load saved looks" });
  }
});

// Upsert one or more looks
router.post("/saved-looks", async (req: AuthedRequest, res: Response) => {
  const body = req.body as { looks?: unknown };
  const looks = Array.isArray(body?.looks) ? body.looks : [];
  if (looks.length === 0 || !looks.every(isValidLook)) {
    res.status(400).json({ error: "Body must be { looks: [{ id, createdAt, ... }] }" });
    return;
  }
  if (looks.length > 200) {
    res.status(400).json({ error: "Too many looks in one request" });
    return;
  }
  try {
    const userId = req.tryverseUserId!;
    for (const look of looks as LookPayload[]) {
      const { id, createdAt, favorite, ...rest } = look;
      await db
        .insert(savedLooksTable)
        .values({
          userId,
          lookId: id,
          favorite: favorite === true,
          createdAt,
          data: rest,
        })
        .onConflictDoUpdate({
          target: [savedLooksTable.userId, savedLooksTable.lookId],
          set: { favorite: favorite === true, createdAt, data: rest },
        });
    }
    res.json({ ok: true, count: looks.length });
  } catch (err) {
    logger.error({ err }, "Failed to upsert saved looks");
    res.status(500).json({ error: "Failed to save looks" });
  }
});

router.delete("/saved-looks/:lookId", async (req: AuthedRequest, res: Response) => {
  try {
    await db
      .delete(savedLooksTable)
      .where(
        and(
          eq(savedLooksTable.userId, req.tryverseUserId!),
          eq(savedLooksTable.lookId, req.params.lookId as string),
        ),
      );
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete saved look");
    res.status(500).json({ error: "Failed to delete look" });
  }
});

export default router;
