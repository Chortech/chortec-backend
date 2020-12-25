import mongoose, { Schema, Document } from 'mongoose';

/**
 * @param email this is email
 * @param phone
 * @param name
 */

interface IUser {
    id: string
    email?: string;
    phone?: string;
    name: string;
}

type UserDoc = IUser & Document;

interface UserModel extends mongoose.Model<UserDoc> {
    build(user: IUser): UserDoc;
}

const userSchema = new Schema({
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    name: String,
});

userSchema.statics.build = (user: IUser) => new User({
    ...user,
    _id: user.id,
  });

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };

export default User;