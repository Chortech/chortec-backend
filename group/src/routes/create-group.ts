import Router from 'express';
import { BadRequestError, ResourceConflictError, requireAuth } from '@chortec/common';
import { validate } from '@chortec/common';
import Joi from 'joi';
import Group from '../models/group';


const router = Router();

const createGroupSchema = Joi.object({
    name: Joi.string(),
    picture: Joi.string().allow(null)
}).label('body');

router.post('/', requireAuth, validate(createGroupSchema), async (req, res) => {
  if (!req.user) throw new BadRequestError('Invalid state!');

  const { name, picture } = req.body;

  const creator = req.user.id;

  if (!creator)
    throw new BadRequestError('Invalid state!');

  const members = [creator];

  const expenseChecks: Map<string, boolean> = new Map([
    [creator, false]
  ]);

  const group = Group.build({
    name,
    creator,
    members,
    expenseChecks,
    picture
  });

  const { _id } = await group.save();

  res.status(201).send({
    id: _id,
    name,
    creator,
    members,
    expenseChecks,
    picture
  });
});

export { router as createGroupRouter };