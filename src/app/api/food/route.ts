import { NextResponse, NextRequest } from "next/server";

interface FoodEntry {
  id: number;
  [key: string]: unknown;
}

let data: FoodEntry[] = []; // temporary memory storage

export async function GET() {
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  data.push({ ...body, id: Date.now() });
  return NextResponse.json(body);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  data = data.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
