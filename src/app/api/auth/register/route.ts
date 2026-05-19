import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    await dbConnect();
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name, email: data.email.toLowerCase(), passwordHash, role: "EMPLOYEE",
    });
    return NextResponse.json({ id: user._id, email: user.email }, { status: 201 });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
