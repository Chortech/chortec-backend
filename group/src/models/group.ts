import mongoose, { Schema, Document } from 'mongoose';

/**
 * @param name
 * @param creator
 * @param users
 */


interface IGroup {
  name: string;
  picture?: string;
  creator: mongoose.Types.ObjectId;
  members?: mongoose.Types.ObjectId[];
  expenseChecks: Map<string, boolean>;
}

type GroupDoc = IGroup & Document;

interface GroupModel extends mongoose.Model<GroupDoc> {
  build(group: IGroup): GroupDoc;
}

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    picture: String,
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expenseChecks: Map,
  },
  {
    toJSON: {
      transform: function (doc, ret, options) {
        const id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.id = id;
      },
    },
    timestamps: true
  }
);

groupSchema.statics.build = (group: IGroup) => new Group(group);

const Group = mongoose.model<GroupDoc, GroupModel>("Group", groupSchema);

export { Group };

export default Group;
