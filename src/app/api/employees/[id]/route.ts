import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Employee from "@/models/Employee";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  department: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  salary: z.coerce.number().min(0).optional(),
  joiningDate: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.date().optional()),
  status: z.enum(["Active", "On Leave", "Inactive"]).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { id } = await params;
  const doc = await Employee.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role?.toUpperCase();
  if (!["ADMIN", "HR", "ADMINISTRATOR", "HR MANAGER", "EMPLOYEE"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const { id } = await params;
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const updated = await Employee.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role?.toUpperCase();
  if (!["ADMIN", "ADMINISTRATOR", "EMPLOYEE"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const { id } = await params;
  const deleted = await Employee.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
