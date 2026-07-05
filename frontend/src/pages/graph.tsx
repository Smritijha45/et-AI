import React, { useState, useEffect } from 'react';
import GraphView from '../components/GraphView';
import { GraphSkeleton } from '../components/Skeleton';
import Link from 'next/link';
import { Network, Search, ShieldAlert, ArrowRight, Info, Eye, Layers } from 'lucide-react';

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

export default function GraphPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View mode toggle
  const [viewMode, setViewMode] = useState<'pyvis' | 'canvas'>('pyvis');

  // Interactive selected state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch reports
        const reportsRes = await fetch('http://localhost:5000/api/report');
        if (!reportsRes.ok) throw new Error('Failed to load reports');
        const reportsJson = await reportsRes.json();
        setReports(reportsJson.data || []);

        // Fetch graph analysis (which also regenerates graph.html on the fly)
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

  // Construct graph nodes and links from MongoDB reports
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

  // Selected node details
  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;
  const pagerank = selectedNodeId && analysis ? analysis.centrality.pagerank[selectedNodeId] : null;
  const betweenness = selectedNodeId && analysis ? analysis.centrality.betweenness[selectedNodeId] : null;
  const confidence = selectedNodeId && analysis ? analysis["confidence scores"][selectedNodeId] : null;

  // Calculate degrees for the selected node
  const degree = selectedNodeId 
    ? links.filter(l => l.source === selectedNodeId || l.target === selectedNodeId).length
    : 0;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            <Network className="w-8 h-8 text-indigo-500" />
            Network Graph Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Visual connection mapping. Select view modes, zoom to inspect details, and hover over elements to read telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center gap-1">
            <button
              onClick={() => setViewMode('pyvis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'pyvis'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              PyVis Graph
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'canvas'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Canvas View
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search entities (e.g. UPI, Device)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && filteredNodes.length > 0 && (
              <div className="absolute top-11 left-0 z-20 w-full bg-slate-900 border border-slate-800 rounded-lg max-h-48 overflow-y-auto shadow-2xl divide-y divide-slate-800/40">
                {filteredNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/50 text-xs text-slate-300 transition-colors flex justify-between items-center"
                  >
                    <span className="truncate font-semibold">{node.label}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{node.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-[500px]">
        {/* Graph Render Container */}
        <div className="lg:col-span-3 h-[600px] relative">
          {loading ? (
            <GraphSkeleton />
          ) : viewMode === 'pyvis' ? (
            <div className="w-full h-full rounded-xl border border-slate-800 overflow-hidden bg-slate-950 relative">
              {/* Legend overlay inside PyVis */}
              <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm border border-slate-800 p-3 rounded-lg text-xs space-y-2 select-none pointer-events-none">
                <h4 className="font-semibold text-slate-300 border-b border-slate-800 pb-1.5 mb-1.5">Network Node Types</h4>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] inline-block"></span>
                  <span>Victims</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block"></span>
                  <span>Phones</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] inline-block"></span>
                  <span>UPI handles</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block"></span>
                  <span>Bank Accounts</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block"></span>
                  <span>Devices</span>
                </div>
              </div>
              
              <iframe
                src="/graph.html"
                className="w-full h-full border-0"
                title="PyVis Fraud Connection Graph"
              />
            </div>
          ) : (
            <GraphView
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="glass-panel border-slate-800/80 rounded-xl p-6 flex flex-col justify-between h-[600px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase tracking-wider mb-2">
                  {selectedNode.type} Node
                </span>
                <h3 className="text-xl font-bold text-white break-all">{selectedNode.label}</h3>
                <p className="text-slate-500 font-mono text-[10px] mt-1 break-all">{selectedNode.id}</p>
              </div>

              {/* Centrality Metrics */}
              <div className="space-y-3.5 border-t border-slate-800/60 pt-5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Centralities</h4>
                
                <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/40 p-2.5 rounded-lg">
                  <span className="text-xs text-slate-400">Degree Connection</span>
                  <span className="text-sm font-semibold text-slate-200">{degree} edges</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/40 p-2.5 rounded-lg">
                  <span className="text-xs text-slate-400">PageRank Importance</span>
                  <span className="text-sm font-semibold text-indigo-400 font-mono">
                    {pagerank !== null && pagerank !== undefined ? pagerank.toFixed(5) : '0.00000'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/40 p-2.5 rounded-lg">
                  <span className="text-xs text-slate-400">Betweenness Centrality</span>
                  <span className="text-sm font-semibold text-pink-400 font-mono">
                    {betweenness !== null && betweenness !== undefined ? betweenness.toFixed(5) : '0.00000'}
                  </span>
                </div>
              </div>

              {/* Confidence Risk Score */}
              {selectedNode.type !== 'Victim' && (
                <div className="space-y-3 border-t border-slate-800/60 pt-5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fraud Risk Engine</h4>
                  
                  {confidence !== null && confidence !== undefined ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Risk Confidence
                        </span>
                        <span className="text-lg font-bold text-rose-400">{(confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-rose-955/40 rounded-full h-1.5">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${confidence * 100}%` }}></div>
                      </div>
                      <p className="text-[10px] text-rose-300/70 leading-relaxed">
                        This entity is shared by multiple victims. High risk indicator.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-slate-800/40 p-3.5 rounded-lg text-slate-500 text-xs flex gap-2">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <span>Not shared. Degree is low. Safe / Unlinked.</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Investigate Action */}
              <div className="pt-2">
                <Link
                  href={`/intelligence?node=${selectedNode.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  View Intelligence Packet
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
              <Network className="w-12 h-12 mb-3 text-slate-700 animate-pulse" />
              <h4 className="font-semibold text-slate-400 mb-1">Select an Entity</h4>
              <p className="text-xs max-w-[200px]">
                {viewMode === 'canvas' 
                  ? 'Click on any node in the canvas layout to audit its centralities and risk scores.' 
                  : 'Search for an entity inside the input box to examine specific risk score details.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
