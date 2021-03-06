import mongoose, { Schema, Document } from 'mongoose';


interface IActivity {
	subject: { id: string, name: string, type: string };
	object: { id: string, name: string, type: string };
	parent?: { id: string, name: string, type: string };
  action: string;
  involved: string[];
  data?: Object;
  request?: Object;
}

type ActivityDoc = IActivity & Document;

interface ActivityModel extends mongoose.Model<ActivityDoc> {
  build(activity: IActivity): ActivityDoc;
}

const activitySchema = new Schema(
  {
    subject: Object,
    object: Object,
    parent: Object,
    action: String,
    involved: [ { type: String } ],
    data: Object,
    request: Object
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function (doc, ret, options) {
        const id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.id = id;
      },
    }, 
  }
);

activitySchema.index({ involved: 1 });

activitySchema.statics.build = (activity: IActivity) => new Activity(activity);

const Activity = mongoose.model<ActivityDoc, ActivityModel>('Activity', activitySchema);

export { Activity, ActivityDoc };

export default Activity;