import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema, logAdminAction } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await ensureSchema();
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }
  const result = await sql`
    SELECT u.id, u.username, u.device_id, u.created_at,
      c.name AS voted_for, c.id AS voted_candidate_id
    FROM app_users u
    LEFT JOIN votes v ON v.user_id = u.id
    LEFT JOIN candidates c ON c.id = v.candidate_id
    ORDER BY u.created_at DESC;
  `;
  return NextResponse.json({ users: result.rows });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  if (!getAdminSession(req)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ไม่พบรหัสผู้ใช้" }, { status: 400 });
  }
  const existing = await sql`SELECT username FROM app_users WHERE id = ${id};`;
  if (!existing.rowCount) {
    return NextResponse.json({ error: "ไม่พบผู้ใช้นี้" }, { status: 404 });
  }
  await sql`DELETE FROM app_users WHERE id = ${id};`;
  await logAdminAction("delete_user", `ลบผู้ใช้: ${existing.rows[0].username}`);
  return NextResponse.json({ ok: true });
}
