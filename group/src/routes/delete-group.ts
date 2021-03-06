import Router from "express";
import { BadRequestError, requireAuth, NotFoundError, Action, Type } from "@chortec/common";
import Group from "../models/group";
import { GroupDeletedPublisher } from "../publishers/group-deleted-publisher";
import { ActivityPublisher } from '../publishers/activity-publisher';
import { natsWrapper } from "../utils/nats-wrapper";
import User from '../models/user';


const router = Router();

router.delete("/", requireAuth, async (req, res) => {
  if (!req.user) throw new BadRequestError("Invalid state!");

  const group = await Group.findById(req.group?.id);

  if (!group)
    throw new NotFoundError(`No groups exist with the id ${req.group?.id}`);

  if (group.creator.toHexString() != req.user.id)
    throw new BadRequestError("You are not the owner of this group!");

  if (group.inActiveExpenses.length != 0)
    throw new BadRequestError(
      "You cannot delete this group because of existing active expenses!"
    );

  await new GroupDeletedPublisher(natsWrapper.client).publish({
    id: req.group!.id,
  });

  const user = await User.findById(req.user.id);
  let involved: string[] = [];

  for (let member of group.members)
    involved.push(member.toHexString());

  await new ActivityPublisher(natsWrapper.client).publish({
    subject: { id: user?.id, name: user?.name!, type: Type.User },
    object: { id: group.id, name: group.name, type: Type.Group },
    parent: undefined,
    action: Action.Deleted,
    involved: involved,
    data: undefined,
    request: undefined
  });

  await Group.deleteOne(group);

  res.status(200).send({
    message: "Deleted the group successfully!",
  });
});

export { router as deleteGroupRouter };
