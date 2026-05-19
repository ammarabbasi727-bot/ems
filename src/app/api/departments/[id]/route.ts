import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Department from "@/models/Department";
import { z } from "zod";

const departmentUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  head: z.string().optional(),
});

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
    const data = departmentUpdateSchema.parse(body);
    const updated = await Department.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues.map(i => i.message).join(", ") : "Failed to update department";
    return NextResponse.json({ error: msg }, { status: 400 });
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
  const deleted = await Department.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  return NextResponse.json({ ok: true, message: "Department deleted successfully" });
}
