import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (!userId || (userRole !== "guru" && userRole !== "admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { absensi_id, status_verifikasi } = await request.json();

    if (!["approved", "rejected"].includes(status_verifikasi)) {
      return NextResponse.json(
        { message: "Status verifikasi tidak valid" },
        { status: 400 },
      );
    }

    await query({
      query: `UPDATE absensi
              SET status_verifikasi = ?,
                  verified_by = ?,
                  verified_at = NOW()
              WHERE id = ?`,
      values: [status_verifikasi, userId, absensi_id],
    });

    return NextResponse.json({
      message: `Absensi berhasil ${status_verifikasi === "approved" ? "disetujui" : "ditolak"}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
