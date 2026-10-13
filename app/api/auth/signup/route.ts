import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await req.json().catch(() => ({}));
    const { firstName, lastName, email, password } = body;
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "First name, last name, email, and password are required." },
        { status: 400 }
      );
    }

    const supabase = db();
    const emailNorm = String(email).trim();

    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .ilike("email", emailNorm)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        firstName,
        lastName,
        email: emailNorm,
        password: await bcrypt.hash(password, 10),
        role: "tenant",
      })
      .select('id, email, "firstName", "lastName", phone, role, avatar')
      .single();
    if (error) throw error;

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
    console.error("signup error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Signup failed." },
      { status: 500 }
    );
  }
}
