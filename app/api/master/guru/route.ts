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

    const guruList: any = await query({
      query: `SELECT
                g.id,
                g.nip,
                g.mata_pelajaran,
                u.nama_lengkap
              FROM guru g
              JOIN users u ON g.user_id = u.id
              ORDER BY u.nama_lengkap`,
      values: [],
    });

    return NextResponse.json({ data: guruList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
