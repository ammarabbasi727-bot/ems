import "dotenv/config";
import * as path from "path";
import * as fs from "fs";
// Load .env.local explicitly (Next-style)
const envLocal = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Employee from "../src/models/Employee";
import Department from "../src/models/Department";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.local");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
  ]);

  const hash = (p: string) => bcrypt.hashSync(p, 10);
  await User.insertMany([
    { name: "Admin User",     email: "admin@ems.com",    passwordHash: hash("admin12345"), role: "ADMIN" },
    { name: "HR Manager",     email: "hr@ems.com",       passwordHash: hash("hr12345"),    role: "HR" },
    { name: "Jane Employee",  email: "employee@ems.com", passwordHash: hash("emp12345"),   role: "EMPLOYEE" },
  ]);

  const deps = await Department.insertMany([
    { name: "Engineering", code: "ENG", manager: "Sarah Chen",  description: "Product & platform engineering" },
    { name: "Design",      code: "DSG", manager: "Marco Reyes", description: "Brand, product, motion" },
    { name: "Marketing",   code: "MKT", manager: "Priya Nair",  description: "Growth, content, brand" },
    { name: "Operations",  code: "OPS", manager: "Daniel Kim",  description: "People, finance, IT" },
  ]);

  const sample = [
    ["Ava Thompson","ava@ems.com","Engineering","Senior Engineer",95000,"Active"],
    ["Liam Patel","liam@ems.com","Engineering","Engineer",75000,"Active"],
    ["Noah Garcia","noah@ems.com","Design","Product Designer",82000,"Active"],
    ["Mia Robinson","mia@ems.com","Design","UX Researcher",68000,"On Leave"],
    ["Ethan Walker","ethan@ems.com","Marketing","Growth Lead",88000,"Active"],
    ["Sophia Wright","sophia@ems.com","Marketing","Content Manager",62000,"Active"],
    ["Lucas Martin","lucas@ems.com","Operations","People Ops",58000,"Active"],
    ["Isabella Clark","bella@ems.com","Operations","Finance Analyst",70000,"Inactive"],
    ["Mason Lee","mason@ems.com","Engineering","Staff Engineer",125000,"Active"],
    ["Olivia Hall","olivia@ems.com","Design","Design Lead",110000,"Active"],
  ] as const;

  let i = 0;
  for (const [fullName, email, department, position, salary, status] of sample) {
    i++;
    await Employee.create({
      employeeId: `EMP-${1000 + i}`,
      fullName, email, department, position, salary, status,
      phone: `+1 555-01${String(i).padStart(2, "0")}`,
      joiningDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365),
      gender: i % 2 ? "Female" : "Male",
    });
  }

  console.log(`Seeded ${deps.length} departments, ${sample.length} employees, 3 users.`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
