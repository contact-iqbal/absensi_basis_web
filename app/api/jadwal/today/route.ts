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
      query: "SELECT kelas_id FROM siswa WHERE user_id = ?",
      values: [userId],
    });

    if (siswaData.length === 0) {
      return NextResponse.json(
        { message: "Data siswa tidak ditemukan" },
        { status: 404 },
      );
    }

    const kelasId = siswaData[0].kelas_id;

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const today = days[new Date().getDay()];

    const jadwalToday: any = await query({
      query: `SELECT
                j.id,
                j.jam_mulai,
                j.jam_selesai,
                mp.nama_mapel,
                u.nama_lengkap as nama_guru
              FROM jadwal j
              JOIN mata_pelajaran mp ON j.mata_pelajaran_id = mp.id
              JOIN guru g ON j.guru_id = g.id
              JOIN users u ON g.user_id = u.id
              WHERE j.kelas_id = ? AND j.hari = ?
              ORDER BY j.jam_mulai`,
      values: [kelasId, today],
    });

    const siswaIdData: any = await query({
      query: "SELECT id FROM siswa WHERE user_id = ?",
      values: [userId],
    });
    const siswaId = siswaIdData[0].id;
    const currentDate = new Date().toISOString().split("T")[0];

    for (const jadwal of jadwalToday) {
      const absensiData: any = await query({
        query: `SELECT status_kehadiran, status_verifikasi
                FROM absensi
                WHERE siswa_id = ? AND jadwal_id = ? AND tanggal = ?`,
        values: [siswaId, jadwal.id, currentDate],
      });

      jadwal.sudah_absen = absensiData.length > 0;
      if (jadwal.sudah_absen) {
        jadwal.status_kehadiran = absensiData[0].status_kehadiran;
        jadwal.status_verifikasi = absensiData[0].status_verifikasi;
      }
    }

    return NextResponse.json({ data: jadwalToday, hari: today });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
