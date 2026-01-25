import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  // Allow only your email
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const allowed = ["xarismpalatzias@gmail.com"];

  if (!email || !allowed.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.brainRunLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}
