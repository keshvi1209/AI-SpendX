import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // TODO: Call Anthropic API
  return NextResponse.json({ success: true, summary: "API called successfully." });
}
