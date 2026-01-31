import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;

    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID siswa harus disediakan" },
        { status: 400 }
      );
    }

    const siswaData: any = await query({
      query: "SELECT user_id FROM siswa WHERE id = ?",
      values: [id],
    });

    if (siswaData.length === 0) {
      return NextResponse.json(
        { message: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    await query({
      query: "DELETE FROM users WHERE id = ?",
      values: [siswaData[0].user_id],
    });

    return NextResponse.json({ message: "Siswa berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
