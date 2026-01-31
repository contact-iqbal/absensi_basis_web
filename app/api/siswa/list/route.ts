import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;

    if (!userRole || (userRole !== "guru" && userRole !== "admin")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const siswaList: any = await query({
      query: `SELECT
                s.id,
                s.user_id,
                s.nis,
                s.kelas_id,
                s.jenis_kelamin,
                s.alamat,
                s.no_telp,
                u.username,
                u.nama_lengkap,
                k.nama_kelas
              FROM siswa s
              JOIN users u ON s.user_id = u.id
              JOIN kelas k ON s.kelas_id = k.id
              ORDER BY k.nama_kelas, u.nama_lengkap`,
      values: [],
    });

    return NextResponse.json({ data: siswaList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
