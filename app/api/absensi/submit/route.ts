import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
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

    const { jadwal_id, status_kehadiran, keterangan } = await request.json();

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
    const today = new Date().toISOString().split("T")[0];

    const existingAbsensi: any = await query({
      query: `SELECT id FROM absensi
              WHERE siswa_id = ? AND jadwal_id = ? AND tanggal = ?`,
      values: [siswaId, jadwal_id, today],
    });

    if (existingAbsensi.length > 0) {
      return NextResponse.json(
        { message: "Anda sudah melakukan absensi untuk jadwal ini hari ini" },
        { status: 400 },
      );
    }

    await query({
      query: `INSERT INTO absensi
              (siswa_id, jadwal_id, tanggal, status_kehadiran, keterangan, status_verifikasi)
              VALUES (?, ?, ?, ?, ?, 'pending')`,
      values: [siswaId, jadwal_id, today, status_kehadiran, keterangan || null],
    });

    return NextResponse.json({
      message: "Absensi berhasil diajukan dan menunggu verifikasi",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
