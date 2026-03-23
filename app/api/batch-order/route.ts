import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ORDERS_PATH = path.join(process.cwd(), ".data", "batch-orders.json");

type BatchOrders = Record<string, string[]>; // batchId -> ordered gen ids

async function readOrders(): Promise<BatchOrders> {
  try {
    const data = await fs.readFile(ORDERS_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeOrders(orders: BatchOrders) {
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

export async function GET() {
  const orders = await readOrders();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const { batchId, order } = await req.json();
  if (!batchId || !Array.isArray(order)) {
    return NextResponse.json({ error: "batchId and order required" }, { status: 400 });
  }
  const orders = await readOrders();
  orders[batchId] = order;
  await writeOrders(orders);
  return NextResponse.json({ ok: true });
}
