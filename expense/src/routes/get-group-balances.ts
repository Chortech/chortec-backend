import {
  BadRequestError,
  validate,
  requireAuth,
  NotFoundError,
} from "@chortec/common";
import { Router } from "express";
import { Expense } from "../models/expense";
import { Group } from "../models/group";
import { graph } from "../utils/neo";
import { query } from "../utils/query";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, async (req, res) => {
  if (!(await Group.areMembersById(req.params.id, [req.user!.id])))
    throw new NotFoundError("user doesn't belong to this group!");

  const expenses = await query.findGroupBalances(req.params.id);

  res.json(expenses);
});

export { router };
