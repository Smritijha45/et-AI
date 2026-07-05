import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TableSkeleton } from '../components/Skeleton';
import Link from 'next/link';
import { 
  FileSearch, 
  Search, 
  User, 
  PhoneCall, 
  Wallet, 
  CreditCard, 
  Smartphone, 
  ShieldAlert, 
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';

interface Report {
  victimId: string;
  victimName: string;
  phoneNumber: string;
  upiId: string;
  bankAccount: string;
  deviceFingerprint: string;
}

interface AnalysisData {
  centrality: {
    pagerank: Record<string, number>;
    betweenness: Record<string, number>;
  };
  "confidence scores": Record<string, number>;
}

interface Node {
  id: string;
  type: string;
  label: string;
}

interface LinkType {
  source: string;
  target: string;
}

export default function IntelligencePage() {
  const router = useRouter();
  const { node: queryNodeId } = router.query;

  const [reports, setReports] = useState<Report[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Active states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch reports
        const reportsRes = await fetch('http://localhost:5000/api/report');
        if (!reportsRes.ok) throw new Error('Failed to load reports');
        const reportsJson = await reportsRes.json();
        setReports(reportsJson.data || []);

        // Fetch graph analysis
        const analysisRes = await fetch('http://localhost:5000/api/graph-analysis');
        if (!analysisRes.ok) throw new Error('Failed to load graph analysis');
        const analysisJson = await analysisRes.json();
        setAnalysis(analysisJson.data || null);
        
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Connection to backend services failed.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update active node from router query parameter
  useEffect(() => {
    if (queryNodeId && typeof queryNodeId === 'string') {
      // Find matches in node keys
      setActiveNodeId(queryNodeId);
    }
  }, [queryNodeId]);

  // Construct graph mapping
  const nodesMap = new Map<string, Node>();
  const links: LinkType[] = [];

  reports.forEach(report => {
    const vicId = `victim:${report.victimId}`;
    if (!nodesMap.has(vicId)) {
      nodesMap.set(vicId, { id: vicId, type: 'Victim', label: report.victimName });
    }

    if (report.phoneNumber && report.phoneNumber.trim()) {
      const pId = `phone:${report.phoneNumber.trim()}`;
      if (!nodesMap.has(pId)) {
        nodesMap.set(pId, { id: pId, type: 'Phone', label: report.phoneNumber });
      }
      links.push({ source: vicId, target: pId });
    }

    if (report.upiId && report.upiId.trim()) {
      const uId = `upi:${report.upiId.trim()}`;
      if (!nodesMap.has(uId)) {
        nodesMap.set(uId, { id: uId, type: 'UPI', label: report.upiId });
      }
      links.push({ source: vicId, target: uId });
    }

    if (report.bankAccount && report.bankAccount.trim()) {
      const bId = `bank:${report.bankAccount.trim()}`;
      if (!nodesMap.has(bId)) {
        nodesMap.set(bId, { id: bId, type: 'BankAccount', label: report.bankAccount });
      }
      links.push({ source: vicId, target: bId });
    }

    if (report.deviceFingerprint && report.deviceFingerprint.trim()) {
      const dId = `device:${report.deviceFingerprint.trim()}`;
      if (!nodesMap.has(dId)) {
        nodesMap.set(dId, { id: dId, type: 'Device', label: report.deviceFingerprint });
      }
      links.push({ source: vicId, target: dId });
    }
  });

  const nodes = Array.from(nodesMap.values());

  // Search filter
  const filteredNodes = searchQuery.trim()
    ? nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Active node details
  const activeNode = activeNodeId ? nodesMap.get(activeNodeId) : null;
  const pagerank = activeNodeId && analysis ? analysis.centrality.pagerank[activeNodeId] : null;
  const betweenness = activeNodeId && analysis ? analysis.centrality.betweenness[activeNodeId] : null;
  const confidence = activeNodeId && analysis ? analysis["confidence scores"][activeNodeId] : null;

  // Identify connected neighbors
  const neighbors: Node[] = [];
  if (activeNodeId) {
    links.forEach(link => {
      if (link.source === activeNodeId) {
        const targetNode = nodesMap.get(link.target);
        if (targetNode) neighbors.push(targetNode);
      } else if (link.target === activeNodeId) {
        const sourceNode = nodesMap.get(link.source);
        if (sourceNode) neighbors.push(sourceNode);
      }
    });
  }

  // Icon mapping
  const getIcon = (type: string) => {
    switch (type) {
      case 'Victim': return User;
      case 'Phone': return PhoneCall;
      case 'UPI': return Wallet;
      case 'BankAccount': return CreditCard;
      case 'Device': return Smartphone;
      default: return Info;
    }
  };

  const getAccentColor = (type: string) => {
    switch (type) {
      case 'Victim': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Phone': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'UPI': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'BankAccount': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Device': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          <FileSearch className="w-8 h-8 text-indigo-500" />
          Intelligence Packet Lookup
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform a deep-dive investigation into a specific victim or shared infrastructure hub to audit associated links.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main search selector */}
      <div className="glass-panel border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="font-semibold text-slate-200 text-sm">Search Entity Database</h3>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Enter Name, Phone, UPI ID, Bank Account or Device Fingerprint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && filteredNodes.length > 0 && (
            <div className="absolute top-12 left-0 z-20 w-full bg-slate-900 border border-slate-800 rounded-lg max-h-60 overflow-y-auto shadow-2xl divide-y divide-slate-800/40">
              {filteredNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => {
                    setActiveNodeId(node.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800/50 text-xs text-slate-300 transition-colors flex justify-between items-center"
                >
                  <span className="truncate font-semibold text-slate-200">{node.label}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{node.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={3} />
      ) : activeNode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel border-slate-800 p-6 rounded-xl space-y-5">
              {/* Entity Icon Header */}
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg border ${getAccentColor(activeNode.type)}`}>
                  {React.createElement(getIcon(activeNode.type), { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono">
                    {activeNode.type} Entity
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 break-all">{activeNode.label}</h3>
                </div>
              </div>

              {/* Centralities */}
              <div className="space-y-3 pt-4 border-t border-slate-850">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metrics Profile</h4>
                
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Network Connections</span>
                  <span className="font-semibold text-slate-200">{neighbors.length} links</span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>PageRank Score</span>
                  <span className="font-semibold font-mono text-indigo-400">
                    {pagerank !== null && pagerank !== undefined ? pagerank.toFixed(5) : '0.00000'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Betweenness Centrality</span>
                  <span className="font-semibold font-mono text-pink-400">
                    {betweenness !== null && betweenness !== undefined ? betweenness.toFixed(5) : '0.00000'}
                  </span>
                </div>
              </div>

              {/* Confidence Score block */}
              {activeNode.type !== 'Victim' && (
                <div className="space-y-3 pt-4 border-t border-slate-850">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Profile</h4>
                  
                  {confidence !== null && confidence !== undefined ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-rose-300 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Fraud Probability
                        </span>
                        <span className="text-base font-bold text-rose-400">{(confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-rose-955/40 rounded-full h-1">
                        <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${confidence * 100}%` }}></div>
                      </div>
                      <p className="text-[9px] text-rose-400/80 leading-relaxed">
                        This entity is shared by multiple victims. High risk indicator.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg text-slate-500 text-xs flex gap-2">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <span>Not shared. Degree is low. Safe / Unlinked.</span>
                    </div>
                  )}
                </div>
              )}

              {/* View in Graph Link */}
              <div className="pt-2">
                <Link
                  href={`/graph?node=${activeNode.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Locate on Network Graph
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Connected Entities neighbors table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel border-slate-800 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-800/60 bg-slate-900/10">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  First-Degree Connected Neighbors ({neighbors.length})
                </h3>
              </div>

              {neighbors.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No active connections found for this node.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/60 bg-slate-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-3.5">Linked Entity</th>
                        <th className="px-6 py-3.5">Type</th>
                        <th className="px-6 py-3.5">Node Key</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                      {neighbors.map((node) => (
                        <tr key={node.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded border ${getAccentColor(node.type)}`}>
                                {React.createElement(getIcon(node.type), { className: 'w-3.5 h-3.5' })}
                              </div>
                              <span className="font-medium text-slate-200">{node.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-400">{node.type}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{node.id}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setActiveNodeId(node.id)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-0.5"
                            >
                              Inspect
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel border-slate-800 rounded-xl p-16 text-center text-slate-500 space-y-4">
          <FileSearch className="w-16 h-16 mx-auto text-slate-700 animate-pulse" />
          <h3 className="font-semibold text-slate-400 text-lg">No Active Investigation Target</h3>
          <p className="text-sm max-w-sm mx-auto">
            Please search for an entity name or ID in the input box above or navigate from the dashboard/graph pages to inspect a node's profile.
          </p>
        </div>
      )}
    </div>
  );
}
