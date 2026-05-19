import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import User, { type Role } from "@/models/User";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret || secret.length < 32) {
  console.warn("Warning: NEXTAUTH_SECRET should be at least 32 characters long.");
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  secret: secret,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: String(user._id), name: user.name, email: user.email, role: user.role as Role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};
