import { NextResponse } from 'next/server';

const mockTreasuryData = {
  totalHoldings: 212534,
  totalValueUSD: 14789000000,
  companies: [
    { name: "MicroStrategy", holdings: 174530, valueUSD: 12145000000 },
    { name: "Marathon Digital", holdings: 13726, valueUSD: 955000000 },
    { name: "Tesla", holdings: 10500, valueUSD: 730000000 },
    { name: "Galaxy Digital", holdings: 8100, valueUSD: 563000000 },
    { name: "Block Inc.", holdings: 5678, valueUSD: 395000000 },
  ],
};

export async function GET() {
  // In a real application, you would fetch this data from an external API.
  // For this mock, we'll add a small random fluctuation to simulate real-time data.
  const fluctuatingData = {
    ...mockTreasuryData,
    totalValueUSD: mockTreasuryData.totalValueUSD * (1 + (Math.random() - 0.5) * 0.02), // +/- 1% fluctuation
  };

  return NextResponse.json(fluctuatingData);
}