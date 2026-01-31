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

    const jadwalList: any = await query({
      query: `SELECT
                j.id,
                j.kelas_id,
                j.mata_pelajaran_id,
                j.guru_id,
                j.hari,
                j.jam_mulai,
                j.jam_selesai,
                k.nama_kelas,
                mp.nama_mapel,
                u.nama_lengkap as nama_guru
              FROM jadwal j
              JOIN kelas k ON j.kelas_id = k.id
              JOIN mata_pelajaran mp ON j.mata_pelajaran_id = mp.id
              JOIN guru g ON j.guru_id = g.id
              JOIN users u ON g.user_id = u.id
              ORDER BY
                FIELD(j.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'),
                j.jam_mulai`,
      values: [],
    });

    return NextResponse.json({ data: jadwalList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
