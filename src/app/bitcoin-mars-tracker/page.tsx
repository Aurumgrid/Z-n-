"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Rocket, Coins, CheckCircle, Circle } from "lucide-react";

// --- Types ---
interface TreasuryData {
  totalHoldings: number;
  totalValueUSD: number;
  companies: {
    name: string;
    holdings: number;
    valueUSD: number;
  }[];
}

// --- Mission Milestones ---
const missionMilestones = [
  { name: "Launch", fundingRequired: 1000000000 },
  { name: "Orbit Insertion", fundingRequired: 5000000000 },
  { name: "Mars Landing", fundingRequired: 10000000000 },
  { name: "Base Establishment", fundingRequired: 15000000000 },
  { name: "First Colony", fundingRequired: 20000000000 },
];

// --- UI Components ---

const MarsMissionSimulation = ({ treasuryValue }: { treasuryValue: number | null }) => {
  const maxFunding = 20000000000;
  const progress = treasuryValue ? Math.min((treasuryValue / maxFunding) * 100, 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Mars Mission Progress
        </CardTitle>
        <CardDescription>
          Mission progress fueled by corporate Bitcoin treasuries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Rocket className="w-16 h-16 text-red-500" />
          <div className="w-full">
            <Progress value={progress} className="h-4" />
            <p className="text-right text-sm text-muted-foreground mt-1">{progress.toFixed(2)}% Funded</p>
          </div>
        </div>
        <div className="space-y-2">
          {missionMilestones.map((milestone) => {
            const isComplete = treasuryValue ? treasuryValue >= milestone.fundingRequired : false;
            return (
              <div key={milestone.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                  <p>{milestone.name}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  ${(milestone.fundingRequired / 1e9).toFixed(1)}B
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const BitcoinTreasuryTracker = ({ data }: { data: TreasuryData | null }) => {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6" />
            Corporate Bitcoin Treasury
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading treasury data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-6 h-6" />
          Corporate Bitcoin Treasury
        </CardTitle>
        <CardDescription>
          Public companies holding Bitcoin on their balance sheets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Holdings (BTC)</TableHead>
              <TableHead>Value (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.companies.map((company) => (
              <TableRow key={company.name}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.holdings.toLocaleString()}</TableCell>
                <TableCell>${(company.valueUSD / 1e9).toFixed(2)}B</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-right">
          <p className="text-lg font-bold">Total Value: ${(data.totalValueUSD / 1e9).toFixed(2)}B</p>
          <p className="text-sm text-muted-foreground">Total Holdings: {data.totalHoldings.toLocaleString()} BTC</p>
        </div>
      </CardContent>
    </Card>
  );
};


export default function BitcoinMarsTrackerPage() {
  const [treasuryData, setTreasuryData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreasuryData = async () => {
      try {
        const response = await fetch('/api/bitcoin/treasury-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch treasury data');
        }
        const data = await response.json();
        setTreasuryData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreasuryData();
    const interval = setInterval(fetchTreasuryData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Bitcoin-Mars Treasury Tracker</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-6">
        An AO app that integrates Bitcoin treasury tracking with a Mars mission simulation, providing real-time analysis of cryptocurrency impact on space exploration funding.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MarsMissionSimulation treasuryValue={treasuryData?.totalValueUSD || null} />
        </div>
        <div className="lg:col-span-2">
          <BitcoinTreasuryTracker data={treasuryData} />
        </div>
      </div>
    </div>
  );
}