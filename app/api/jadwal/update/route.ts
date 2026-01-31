import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;

    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, kelas_id, mata_pelajaran_id, guru_id, hari, jam_mulai, jam_selesai } =
      await request.json();

    if (
      !id ||
      !kelas_id ||
      !mata_pelajaran_id ||
      !guru_id ||
      !hari ||
      !jam_mulai ||
      !jam_selesai
    ) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    await query({
      query: `UPDATE jadwal
              SET kelas_id = ?, mata_pelajaran_id = ?, guru_id = ?, hari = ?, jam_mulai = ?, jam_selesai = ?
              WHERE id = ?`,
      values: [kelas_id, mata_pelajaran_id, guru_id, hari, jam_mulai, jam_selesai, id],
    });

    return NextResponse.json({ message: "Jadwal berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
