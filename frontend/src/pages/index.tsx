import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '../components/StatCard';
import { TableSkeleton } from '../components/Skeleton';
import { NodeDistributionChart, RiskProfileChart } from '../components/AnalyticsCharts';
import { 
  FileText, 
  Network, 
  PhoneCall, 
  Smartphone, 
  ArrowUpRight, 
  Clock, 
  User, 
  AlertTriangle,
  Terminal,
  Activity
} from 'lucide-react';

interface Report {
  _id: string;
  victimId: string;
  victimName: string;
  phoneNumber: string;
  upiId: string;
  bankAccount: string;
  deviceFingerprint: string;
  reportTimestamp: string;
}

interface AnalysisData {
  communities: Array<{ id: number; nodes: string[] }>;
  "graph stats": {
    totalNodes: number;
    totalEdges: number;
    nodeTypeCounts: Record<string, number>;
  };
  "confidence scores": Record<string, number>;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forensics terminal logging lines
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch reports
        const reportsRes = await fetch('http://localhost:5000/api/report');
        if (!reportsRes.ok) throw new Error('Failed to fetch reports list');
        const reportsJson = await reportsRes.json();
        const allReports = reportsJson.data || [];
        setReports(allReports);

        // Fetch graph analysis
        const analysisRes = await fetch('http://localhost:5000/api/graph-analysis');
        if (!analysisRes.ok) throw new Error('Failed to fetch graph analysis');
        const analysisJson = await analysisRes.json();
        const analysisData = analysisJson.data || null;
        setAnalysis(analysisData);
        
        // Populate terminal logs dynamically
        if (analysisData) {
          const timestamp = new Date().toLocaleTimeString();
          const logsList = [
            `[${timestamp}] INITIALIZING GRAPH ENGINE: Loading network libraries...`,
            `[${timestamp}] DATABASE SYNC: Pulled ${allReports.length} reports successfully from MongoDB.`,
            `[${timestamp}] GRAPH COMPILE: Compiled ${analysisData["graph stats"].totalNodes} nodes and ${analysisData["graph stats"].totalEdges} undirected links.`,
            `[${timestamp}] LOUVAIN MODULARITY: Partitioned graph into ${analysisData.communities.length} clusters (size > 5 indicates collusion).`,
            `[${timestamp}] RISK ASSESSMENT: Calculated PageRank & Betweenness Centrality for all hubs.`,
            `[${timestamp}] RISK ALIGNMENT: Flagged ${Object.keys(analysisData["confidence scores"]).length} shared infrastructure entities above risk threshold.`,
            `[${timestamp}] DIAGNOSTIC COMPLETE: Forensic network graph is stable. Ready for queries.`
          ];
          setLogs(logsList);
        }
        
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Connection to backend services failed. Make sure the Node server is running on port 5000.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Compute stats card metrics
  const totalReports = reports.length;
  
  // A community with size > 5 signifies multiple victims sharing entities (a fraud ring)
  const communities = analysis?.communities || [];
  const fraudRingsCount = communities.filter(c => c.nodes.length > 5).length;
  
  const confidenceScores = analysis?.["confidence scores"] || {};
  
  // Count suspicious phones and devices (confidence > 0.5)
  const suspiciousPhones = Object.keys(confidenceScores).filter(
    key => key.startsWith('phone:') && confidenceScores[key] > 0.5
  ).length;

  const suspiciousDevices = Object.keys(confidenceScores).filter(
    key => key.startsWith('device:') && confidenceScores[key] > 0.5
  ).length;

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl glow-text-gradient">
            Cybercrime Forensics & Graph Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            Active monitoring engine. Resolving multi-hop linkages and mule rings dynamically.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports Logged"
          value={totalReports}
          icon={FileText}
          description="Submitted cases"
          loading={loading}
          accentColor="indigo"
        />
        <StatCard
          title="Active Fraud Rings"
          value={fraudRingsCount}
          icon={Network}
          description="Linked networks detected"
          loading={loading}
          trend={fraudRingsCount > 0 ? `${fraudRingsCount} detected` : undefined}
          trendType={fraudRingsCount > 0 ? 'negative' : 'neutral'}
          accentColor="pink"
        />
        <StatCard
          title="Suspicious Phone Hubs"
          value={suspiciousPhones}
          icon={PhoneCall}
          description="Shared across victims"
          loading={loading}
          trend={suspiciousPhones > 0 ? 'High Risk' : undefined}
          trendType={suspiciousPhones > 0 ? 'negative' : 'neutral'}
          accentColor="orange"
        />
        <StatCard
          title="Suspicious Device Hubs"
          value={suspiciousDevices}
          icon={Smartphone}
          description="Scammer emulators"
          loading={loading}
          trend={suspiciousDevices > 0 ? 'High Risk' : undefined}
          trendType={suspiciousDevices > 0 ? 'negative' : 'neutral'}
          accentColor="rose"
        />
      </div>

      {/* Telemetry Charts */}
      {analysis && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel border-slate-800/80 rounded-xl p-6 bg-slate-900/10 hover:border-slate-800 transition-colors">
            <h3 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider font-mono">
              <Network className="w-4 h-4 text-indigo-400" />
              Graph Node Distribution
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">Breakdown of unique structural entity nodes in the database.</p>
            <NodeDistributionChart nodeTypeCounts={analysis["graph stats"].nodeTypeCounts} />
          </div>

          <div className="glass-panel border-slate-800/80 rounded-xl p-6 bg-slate-900/10 hover:border-slate-800 transition-colors">
            <h3 className="font-semibold text-slate-100 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Entity Risk Classification
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">Risk levels computed dynamically by sharing degree and PageRank.</p>
            <RiskProfileChart confidenceScores={analysis["confidence scores"]} />
          </div>
        </div>
      )}

      {/* Recent Reports Section */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="glass-panel border-slate-800/80 rounded-xl overflow-hidden shadow-2xl bg-slate-900/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-slate-100">Recent Fraud Reports</h3>
              </div>
              <span className="text-xs text-slate-400">Showing {reports.length} total entries</span>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No fraud reports recorded in database. Use API to log reports.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-slate-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3.5">Victim</th>
                      <th className="px-6 py-3.5">Phone Number</th>
                      <th className="px-6 py-3.5">UPI ID</th>
                      <th className="px-6 py-3.5">Bank Account</th>
                      <th className="px-6 py-3.5">Device Fingerprint</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                    {reports.slice(0, 10).map((report) => (
                      <tr key={report._id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-200">{report.victimName}</div>
                              <div className="text-xs text-slate-500 font-mono">{report.victimId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{report.phoneNumber || '—'}</td>
                        <td className="px-6 py-4 font-mono text-xs text-indigo-300">{report.upiId || '—'}</td>
                        <td className="px-6 py-4 font-mono text-xs">{report.bankAccount || '—'}</td>
                        <td className="px-6 py-4 font-mono text-xs text-pink-300">{report.deviceFingerprint || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/intelligence?node=victim:${report.victimId}`}
                            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                          >
                            Investigate
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forensics Terminal Logs */}
      {logs.length > 0 && !loading && (
        <div className="glass-panel border-slate-800/80 rounded-xl p-5 shadow-2xl bg-slate-950/60 font-mono text-xs text-indigo-400">
          <div className="flex items-center justify-between border-b border-indigo-950/40 pb-3 mb-3">
            <div className="flex items-center gap-2 text-indigo-300">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>FORENSIC TELEMETRY CONSOLE</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin select-all">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-indigo-600/80 select-none">➔</span>
                <p>{log}</p>
              </div>
            ))}
            <div className="text-indigo-300 flex items-center gap-1">
              <span>➔ [system] listening for incoming logs</span>
              <span className="terminal-cursor font-bold">█</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
