import { Schema, model, models } from "mongoose";

const DepartmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    manager: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default models.Department || model("Department", DepartmentSchema);
