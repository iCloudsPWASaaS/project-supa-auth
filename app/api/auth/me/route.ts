import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";

export async function GET() {
  const userId = readSession();
  if (!userId) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  try {
    const supabase = db();
    const { data: user, error } = await supabase
      .from("users")
      .select('id, email, "firstName", "lastName", phone, role, avatar')
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

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
    console.error("me error", err);
    return NextResponse.json({ ok: false, user: null }, { status: 500 });
  }
}
