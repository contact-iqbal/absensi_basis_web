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

    const kelasList: any = await query({
      query: "SELECT id, nama_kelas, tingkat FROM kelas ORDER BY tingkat, nama_kelas",
      values: [],
    });

    return NextResponse.json({ data: kelasList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
