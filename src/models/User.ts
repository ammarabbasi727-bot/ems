import { Schema, model, models, type InferSchemaType } from "mongoose";

export const ROLES = ["ADMIN", "HR", "EMPLOYEE"] as const;
export type Role = (typeof ROLES)[number];

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "EMPLOYEE" },
    avatar: { type: String },
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof UserSchema> & { _id: string };
export default models.User || model("User", UserSchema);
