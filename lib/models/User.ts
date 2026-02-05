import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  _id: string;
  clerkUserId: string;
  email: string;
  name: string;
  image?: string;
  businessType?: string;
  businessName?: string;
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: String,
    businessType: {
      type: String,
      enum: ['Manufacturing', 'Retail', 'Agriculture', 'Services', 'Logistics', 'E-commerce', 'Other'],
    },
    businessName: String,
    industry: String,
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
