"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Rocket, Network, Cpu, Database, AlertTriangle, Plus } from "lucide-react";
import { NodeDetailsDialog } from "@/components/NodeDetailsDialog";
import { useAuth } from "@/hooks/useAuth";

interface EthereumStats {
  blockNumber: string;
  gasPrice: string;
}

interface AurumGridStatus {
  nodeCount: number;
  averageCoherence: number;
}

export default function SpaceshipDashboard() {
  const { isAuthenticated } = useAuth();
  const [ethStats, setEthStats] = useState<EthereumStats | null>(null);
  const [aurumStats, setAurumStats] = useState<AurumGridStatus | null>(null);
  const [loadingEth, setLoadingEth] = useState(true);
  const [loadingAurum, setLoadingAurum] = useState(true);

  useEffect(() => {
    const fetchEthStats = async () => {
      try {
        const response = await fetch("/api/ethereum/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch Ethereum stats");
        }
        const data = await response.json();
        setEthStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingEth(false);
      }
    };

    const fetchAurumStats = async () => {
      try {
        const response = await fetch("/api/aurum-grid/status");
        if (!response.ok) {
          throw new Error("Failed to fetch AurumGrid status");
        }
        const data = await response.json();
        setAurumStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAurum(false);
      }
    };

    fetchEthStats();
    fetchAurumStats();
    const ethInterval = setInterval(fetchEthStats, 15000); // Refresh every 15 seconds
    const aurumInterval = setInterval(fetchAurumStats, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(ethInterval);
      clearInterval(aurumInterval);
    };
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Spaceship Dashboard</h1>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link href="/posts/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </Link>
          )}
          <Badge variant="outline">Ethereum Network: Mainnet</Badge>
          <Badge variant="secondary">Status: {loadingEth ? "Connecting..." : "Connected"}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column for spaceship visualization */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                AurumGrid Spaceship Visualization
              </CardTitle>
              <CardDescription>
                Real-time visualization of the Ethereum-AurumGrid spaceship metaphor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[600px] bg-gray-900 rounded-lg text-white">
                <p>Spaceship visualization will be rendered here.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column for real-time data */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Ethereum Network
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Latest Block</p>
                <p className="text-2xl font-bold">{loadingEth ? "Loading..." : ethStats?.blockNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gas Price (Gwei)</p>
                <p className="text-2xl font-bold">{loadingEth ? "Loading..." : ethStats?.gasPrice}</p>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer">
                  View on Etherscan
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                AurumGrid Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Harmonic Nodes</p>
                <p className="text-2xl font-bold">{loadingAurum ? "Loading..." : aurumStats?.nodeCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coherence Level</p>
                <p className="text-2xl font-bold">{loadingAurum ? "Loading..." : aurumStats?.averageCoherence}</p>
              </div>
              <NodeDetailsDialog />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No active alerts.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AO Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/bitcoin-mars-tracker">
                <Button className="w-full" variant="outline">
                  Bitcoin-Mars Treasury Tracker
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Value (ETH)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>0xabc...def</TableCell>
                  <TableCell>19,234,566</TableCell>
                  <TableCell>0x123...456</TableCell>
                  <TableCell>0x789...abc</TableCell>
                  <TableCell>1.23</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>0xghi...jkl</TableCell>
                  <TableCell>19,234,565</TableCell>
                  <TableCell>0xdef...ghi</TableCell>
                  <TableCell>0x456...789</TableCell>
                  <TableCell>0.5</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}