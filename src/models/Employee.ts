import { Schema, model, models } from "mongoose";

const EmployeeSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    cnic: String,
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    department: { type: String, required: true },
    position: { type: String, required: true },
    salary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "On Leave", "Inactive"], default: "Active" },
    address: String,
    emergencyContact: String,
    avatar: String,
  },
  { timestamps: true }
);

export default models.Employee || model("Employee", EmployeeSchema);
