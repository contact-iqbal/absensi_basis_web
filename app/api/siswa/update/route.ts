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

    const {
      id,
      user_id,
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
      !id ||
      !user_id ||
      !username ||
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
      query: "SELECT id FROM users WHERE username = ? AND id != ?",
      values: [username, user_id],
    });

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    const existingNis: any = await query({
      query: "SELECT id FROM siswa WHERE nis = ? AND id != ?",
      values: [nis, id],
    });

    if (existingNis.length > 0) {
      return NextResponse.json(
        { message: "NIS sudah digunakan" },
        { status: 400 }
      );
    }

    if (password && password.trim() !== "") {
      await query({
        query: `UPDATE users SET username = ?, password = ?, nama_lengkap = ? WHERE id = ?`,
        values: [username, password, nama_lengkap, user_id],
      });
    } else {
      await query({
        query: `UPDATE users SET username = ?, nama_lengkap = ? WHERE id = ?`,
        values: [username, nama_lengkap, user_id],
      });
    }

    await query({
      query: `UPDATE siswa
              SET nis = ?, kelas_id = ?, jenis_kelamin = ?, alamat = ?, no_telp = ?
              WHERE id = ?`,
      values: [nis, kelas_id, jenis_kelamin, alamat || null, no_telp || null, id],
    });

    return NextResponse.json({ message: "Data siswa berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
