import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;

    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      username,
      password,
      nama_lengkap,
      nis,
      kelas_id,
      jenis_kelamin,
      alamat,
      no_telp,
    } = await request.json();

    if (
      !username ||
      !password ||
      !nama_lengkap ||
      !nis ||
      !kelas_id ||
      !jenis_kelamin
    ) {
      return NextResponse.json(
        { message: "Field wajib harus diisi" },
        { status: 400 }
      );
    }

    const existingUser: any = await query({
      query: "SELECT id FROM users WHERE username = ?",
      values: [username],
    });

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    const existingNis: any = await query({
      query: "SELECT id FROM siswa WHERE nis = ?",
      values: [nis],
    });

    if (existingNis.length > 0) {
      return NextResponse.json(
        { message: "NIS sudah digunakan" },
        { status: 400 }
      );
    }

    const userResult: any = await query({
      query: `INSERT INTO users (username, password, nama_lengkap, role)
              VALUES (?, ?, ?, 'siswa')`,
      values: [username, password, nama_lengkap],
    });

    const userId = userResult.insertId;

    await query({
      query: `INSERT INTO siswa (user_id, nis, kelas_id, jenis_kelamin, alamat, no_telp)
              VALUES (?, ?, ?, ?, ?, ?)`,
      values: [userId, nis, kelas_id, jenis_kelamin, alamat || null, no_telp || null],
    });

    return NextResponse.json({ message: "Siswa berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
