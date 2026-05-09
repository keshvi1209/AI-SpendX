import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // TODO: Save audit to Supabase
  return NextResponse.json({ success: true, message: "Audit saved" });
}
