import { Router } from "express";
import {
  BadRequestError,
  requireAuth,
  NotFoundError,
  GroupUpdateType,
  Action,
  Type
} from "@chortec/common";
import Group from "../models/group";
import mongoose from "mongoose";
import { GroupUpdatedPublisher } from "../publishers/group-updated-publisher";
import { natsWrapper } from "../utils/nats-wrapper";
import { ActivityPublisher } from "../publishers/activity-publisher";
import User from "../models/user";


const router = Router({ mergeParams: true });

router.put("/", requireAuth, async (req, res) => {
  if (!req.user) throw new BadRequestError("Invalid state!");

  const member = req.params.mid;

  const exists = await Group.exists({ _id: req.group?.id });
  const user = mongoose.Types.ObjectId(req.user.id);

  if (!exists)
    throw new NotFoundError(`No groups exist with the id ${req.group?.id}`);

  if (await Group.exists({ _id: req.group?.id, members: { $nin: [user] } }))
    throw new BadRequestError("You are not a member of this group!");

  if (await Group.exists({ _id: req.group?.id, creator: member }))
    throw new BadRequestError(
      "You cannot remove this user because they are the owner of the group!"
    );

  if (
    await Group.exists({
      _id: req.group?.id,
      inActiveExpenses: { $in: [user] },
    })
  )
    throw new BadRequestError(
      "You cannot remove this member because he participates in an active expense!"
    );

  const raw = await Group.updateOne(
    {
      _id: req.group?.id,
    },
    { $pull: { members: mongoose.Types.ObjectId(member) } }
  );

  const gp = await Group.findById(req.group?.id);

  await new GroupUpdatedPublisher(natsWrapper.client).publish({
    id: gp!.id,
    removed: member,
    type: GroupUpdateType.RemoveMember,
  });

  const usr = await User.findById(user);
  const removed = await User.findById(member);
  let involved: string[] = [];

  for (let member of gp?.members!)
    involved.push(member.toHexString());
  
  involved.push(member);

  await new ActivityPublisher(natsWrapper.client).publish({
    subject: { id: usr?.id, name: usr?.name!, type: Type.User },
    object: { id: removed?.id, name: removed?.name!, type: Type.User },
    parent: { id: gp?.id, name: gp?.name!, type: Type.Group },
    action: Action.Removed,
    involved: involved,
    data: undefined,
    request: { type: Type.Group, id: gp?.id }
  });

  const group = await Group.findById(req.group?.id)
    .populate("members")
    .populate("creator");

  res.status(200).json(group);
});

export { router as removeMemberRouter };
