import {
  BadRequestError,
  validate,
  requireAuth,
  NotFoundError,
} from "@chortec/common";
import { Router } from "express";
import Joi from "joi";
import { graph, Nodes, Participant, PRole } from "../utils/neo";

const router = Router({ mergeParams: true });

const schema = Joi.object({
  id: Joi.string(),
  description: Joi.string(),
  total: Joi.number(),
  paid_at: Joi.number(),
  participants: Joi.array()
    .items(
      Joi.object({
        id: Joi.string(),
        role: Joi.string().valid(PRole.Creditor, PRole.Debtor),
        amount: Joi.number(),
      })
    )
    .min(2),
  group: Joi.string(),
  notes: Joi.string(),
});

router.put("/", requireAuth, validate(schema), async (req, res) => {
  const expense = await graph.getExpense(req.params.id);

  if (!expense)
    throw new NotFoundError("Expense with the given id doesn't exist!");

  const participants = new Map<string, Participant>();
  for (const p of expense.participants) {
    participants.set(p.id, p);
  }

  if (req.body.description) expense.description = req.body.description;
  if (req.body.paid_at) expense.paid_at = req.body.paid_at;
  if (req.body.group) expense.group = req.body.group;
  if (req.body.notes) expense.notes = req.body.notes;
  if (req.body.total) expense.total = req.body.total;

  // see if there is a change in participants
  let changed = false;
  if (req.body.participants) {
    const count = await graph.countParticipants(req.body.participants);

    if (req.body.participants.length != count)
      throw new BadRequestError("One of the participants doesn't exits!");

    if (req.body.participants.length === expense.participants.length) {
      for (let i = 0; i < req.body.participants.length; i++) {
        const p1 = req.body.participants[i];
        if (!participants.has(p1.id)) {
          changed = true;
          break;
        }
        const p2 = participants.get(p1.id);

        if (!equals(p1, p2!)) {
          changed = true;
          break;
        }
      }
    } else changed = true;
  }

  if (changed) {
    expense.participants = req.body.participants;
  }

  await graph.updateExpense(expense, changed);

  // if (req.body.participants) newexpense.total = req.body.total;
  // await graph.removeExpense(newexpense.id);
  res.json(changed);
});

function equals(p1: Participant, p2: Participant) {
  return p1.id === p2.id && p1.amount === p2.amount && p1.role === p2.role;
}

export { router };