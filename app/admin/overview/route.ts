import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  // Count ads in AdPerformance table
  const ads = await prisma.adPerformance.count();

  // Count brains
  const brains = await prisma.aIBrain.count();

  // Group brains by state
  const grouped = await prisma.aIBrain.groupBy({
    by: ['state'],
    _count: { state: true }
  });
  const byState = Object.fromEntries(grouped.map(g => [g.state ?? 'UNKNOWN', g._count.state]));

  // Budget per ad (from env & your Stage 8 logic)
  const dailyBudget = Number(process.env.BRAIN_DAILY_BUDGET ?? 30);
  const active = Math.max(1, brains || ads || 1);
  const budgetPerAd = (dailyBudget / active).toFixed(2);

  return NextResponse.json({ ads, brains, byState, budgetPerAd });
}
