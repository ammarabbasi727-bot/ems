import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Employee from "@/models/Employee";
import { z } from "zod";

const employeeSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  department: z.string().min(1),
  position: z.string().min(1),
  salary: z.coerce.number().min(0).default(0),
  joiningDate: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.date().optional()),
  status: z.enum(["Active", "On Leave", "Inactive"]).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  avatar: z.string().optional(),
});

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return session;
}

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const dept = url.searchParams.get("department")?.trim();
  const status = url.searchParams.get("status")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Number(url.searchParams.get("limit") || 20));
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [
    { fullName: { $regex: q, $options: "i" } },
    { email: { $regex: q, $options: "i" } },
    { employeeId: { $regex: q, $options: "i" } },
  ];
  if (dept) filter.department = dept;
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    Employee.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Employee.countDocuments(filter),
  ]);
  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role?.toUpperCase();
  if (!["ADMIN", "HR", "ADMINISTRATOR", "HR MANAGER", "EMPLOYEE"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const data = employeeSchema.parse(body);
    await dbConnect();
    const count = await Employee.countDocuments();
    const employeeId = `EMP-${String(1000 + count + 1)}`;
    const created = await Employee.create({ ...data, employeeId });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues.map(i => i.message).join(", ") : "Failed to create";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
