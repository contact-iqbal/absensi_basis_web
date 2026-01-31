import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;

    if (!userRole || (userRole !== "guru" && userRole !== "admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const absensiList: any = await query({
      query: `SELECT
                a.id,
                a.tanggal,
                a.waktu_absen,
                a.status_kehadiran,
                a.status_verifikasi,
                a.keterangan,
                u.nama_lengkap as nama_siswa,
                s.nis,
                k.nama_kelas,
                mp.nama_mapel,
                j.jam_mulai,
                j.jam_selesai
              FROM absensi a
              JOIN siswa s ON a.siswa_id = s.id
              JOIN users u ON s.user_id = u.id
              JOIN kelas k ON s.kelas_id = k.id
              JOIN jadwal j ON a.jadwal_id = j.id
              JOIN mata_pelajaran mp ON j.mata_pelajaran_id = mp.id
              WHERE a.status_verifikasi = ?
              ORDER BY a.waktu_absen DESC`,
      values: [status],
    });

    return NextResponse.json({ data: absensiList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
