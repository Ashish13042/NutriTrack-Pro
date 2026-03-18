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
  const body = await req.json();
  if (body.id !== undefined) {
    // Delete a single item by id
    data = data.filter(item => item.id !== body.id);
  } else {
    // No id provided — clear all items
    data = [];
  }
  return NextResponse.json({ success: true });
}
