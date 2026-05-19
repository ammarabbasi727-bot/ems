import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Department from "@/models/Department";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  head: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const items = await Department.find().sort({ name: 1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const role = (session.user as any).role?.toUpperCase();
  if (!["ADMIN", "HR", "ADMINISTRATOR", "HR MANAGER", "EMPLOYEE"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const data = departmentSchema.parse(body);
    await dbConnect();
    const created = await Department.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create department" }, { status: 400 });
  }
}