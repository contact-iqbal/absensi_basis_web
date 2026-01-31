import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (!userId || userRole !== "siswa") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const siswaData: any = await query({
      query: "SELECT id FROM siswa WHERE user_id = ?",
      values: [userId],
    });

    if (siswaData.length === 0) {
      return NextResponse.json(
        { message: "Data siswa tidak ditemukan" },
        { status: 404 },
      );
    }

    const siswaId = siswaData[0].id;

    const history: any = await query({
      query: `SELECT
                a.id,
                a.tanggal,
                a.waktu_absen,
                a.status_kehadiran,
                a.status_verifikasi,
                a.keterangan,
                mp.nama_mapel,
                j.jam_mulai,
                j.jam_selesai,
                u.nama_lengkap as verified_by_name
              FROM absensi a
              JOIN jadwal j ON a.jadwal_id = j.id
              JOIN mata_pelajaran mp ON j.mata_pelajaran_id = mp.id
              LEFT JOIN users u ON a.verified_by = u.id
              WHERE a.siswa_id = ?
              ORDER BY a.tanggal DESC, a.waktu_absen DESC
              LIMIT 50`,
      values: [siswaId],
    });

    return NextResponse.json({ data: history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
