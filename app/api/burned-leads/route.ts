import { NextResponse } from "next/server";
import { getBurnedLeads } from "@/lib/storage/local";

export async function GET() {
  const leads = await getBurnedLeads();
  return NextResponse.json({ leads, total: leads.length });
}
