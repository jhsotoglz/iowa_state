// src/app/backend/health/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/database/mongodb";  
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const started = Date.now();
  try {
    const db = await getDb();
    const ping = await db.command({ ping: 1 });
    return NextResponse.json(
      {
        ok: true,
        mongo: {
          ping: ping?.ok === 1 ? "ok" : "fail",
          db: db.databaseName,
          latencyMs: Date.now() - started,
        },
        time: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err), latencyMs: Date.now() - started },
      { status: 500 }
    );
  }
}
