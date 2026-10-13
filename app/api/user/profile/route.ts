import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";

export async function PUT(req: Request) {
  const userId = readSession();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await req.json().catch(() => ({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    if (typeof body.firstName === "string") update.firstName = body.firstName;
    if (typeof body.lastName === "string") update.lastName = body.lastName;
    if (typeof body.phone === "string") update.phone = body.phone;
    if (typeof body.avatar === "string") update.avatar = body.avatar;

    const supabase = db();
    const { data: user, error } = await supabase
      .from("users")
      .update(update)
      .eq("id", userId)
      .select('id, email, "firstName", "lastName", phone, role, avatar')
      .single();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
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
    console.error("profile update error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not save profile." },
      { status: 500 }
    );
  }
}
