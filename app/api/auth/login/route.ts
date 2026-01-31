import { query } from "@/lib/db";
import { NextResponse } from "next/server";
// Tips: Nantinya gunakan library 'iron-session' atau 'jose' untuk enkripsi cookie yang lebih aman
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Query mencari user berdasarkan username & password
    const users: any = await query({
      query:
        "SELECT id, username, nama_lengkap, role FROM users WHERE username = ? AND password = ?",
      values: [username, password],
    });

    if (users.length > 0) {
      const user = users[0];

      // Simpan data user di cookie (Simpel untuk keperluan belajar)
      const response = NextResponse.json({
        message: "Login Berhasil",
        role: user.role,
      });

      // Mengatur cookie agar bisa dibaca oleh middleware/server component
      (await cookies()).set("user_role", user.role, { path: "/" });
      (await cookies()).set("user_id", user.id.toString(), { path: "/" });

      return response;
    } else {
      return NextResponse.json(
        { message: "Username atau Password Salah" },
        { status: 401 },
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
