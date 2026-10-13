import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { email, password } = (await req.json().catch(() => ({}))) as any;
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = db();
    // The unique index is on lower(email) and the demo row is stored lowercased,
    // so an ilike lookup makes the login case-insensitive either way.
    const { data: user, error } = await supabase
      .from("users")
      .select('id, email, password, "firstName", "lastName", phone, role, avatar')
      .ilike("email", String(email).trim())
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password || "");
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await supabase
      .from("users")
      .update({ lastLogin: new Date().toISOString() })
      .eq("id", user.id);

    createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || null,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Login failed." },
      { status: 500 }
    );
  }
}
