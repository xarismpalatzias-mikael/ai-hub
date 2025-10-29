import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { data } = Papa.parse(text, { header: true });

    let count = 0;
    for (const row of data) {
      if (!row["Campaign ID"]) continue;
      await prisma.adPerformance.upsert({
        where: { adId: row["Campaign ID"] },
        update: {
          adName: row["Campaign Name"],
          impressions: parseInt(row["Impressions"] || "0"),
          clicks: parseInt(row["Clicks"] || "0"),
          spend: parseFloat(row["Spend"] || "0"),
          ctr: parseFloat((row["CTR"] || "0").replace("%", "")),
          conversions: parseInt(row["Conversions"] || "0"),
          updatedAt: new Date(),
        },
        create: {
          adId: row["Campaign ID"],
          adName: row["Campaign Name"],
          impressions: parseInt(row["Impressions"] || "0"),
          clicks: parseInt(row["Clicks"] || "0"),
          spend: parseFloat(row["Spend"] || "0"),
          ctr: parseFloat((row["CTR"] || "0").replace("%", "")),
          conversions: parseInt(row["Conversions"] || "0"),
        },
      });
      count++;
    }

    return NextResponse.json({ ok: true, count });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
