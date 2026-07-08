import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TableSkeleton } from '../components/Skeleton';
import { 
  Users, 
  User, 
  Smartphone, 
  PhoneCall, 
  Wallet, 
  CreditCard,
  ArrowRight,
  ShieldAlert,
  Network
} from 'lucide-react';
import OnboardingGuide from '../components/OnboardingGuide';

interface Cluster {
  id: number;
  nodes: string[];
}

interface AnalysisData {
  communities: Cluster[]; // Matches the backend API field name "communities"
}

export default function ClustersPage() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/graph-analysis');
        if (!res.ok) throw new Error('Failed to load analysis');
        const json = await res.json();
        setAnalysis(json.data || null);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Connection to backend services failed.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, []);

  // Helper to parse entity types in a cluster
  const classifyNodes = (nodeIds: string[]) => {
    const victims: string[] = [];
    const phones: string[] = [];
    const upis: string[] = [];
    const banks: string[] = [];
    const devices: string[] = [];

    nodeIds.forEach(nodeId => {
      const [type, ...parts] = nodeId.split(':');
      const val = parts.join(':');

      if (type === 'victim') victims.push(val);
      else if (type === 'phone') phones.push(val);
      else if (type === 'upi') upis.push(val);
      else if (type === 'bank') banks.push(val);
      else if (type === 'device') devices.push(val);
    });

    return { victims, phones, upis, banks, devices };
  };

  const clusters = analysis?.communities || [];
  
  // Filter for actual fraud rings (size > 5, indicating resource sharing across victims)
  const fraudRings = clusters
    .filter(c => c.nodes.length > 5)
    .map(c => ({
      ...c,
      entities: classifyNodes(c.nodes)
    }))
    .sort((a, b) => b.nodes.length - a.nodes.length); // largest first

  return (
    <div className="space-y-6">
      {/* Onboarding tooltips */}
      <OnboardingGuide 
        pageName="clusters"
        message="This page shows clusters of related fraud cases identified using graph analysis."
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          <Users className="w-8 h-8 text-indigo-500" />
          Fraud Ring Clusters
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Clusters detected via the Louvain Modularity algorithm. High modularity groups represent coordinated syndicates sharing assets.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={4} />
      ) : fraudRings.length === 0 ? (
        <div className="glass-panel border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-4">
          <Network className="w-16 h-16 mx-auto text-slate-700 animate-pulse" />
          <h3 className="font-semibold text-slate-400 text-lg">No Multi-Victim Fraud Clusters Detected</h3>
          <p className="text-sm max-w-md mx-auto">
            All logged reports represent isolated incidents with unique attributes. Coordinated scam clusters will be listed here when shared resources are detected.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fraudRings.map((ring, idx) => {
            const { victims, phones, upis, banks, devices } = ring.entities;
            return (
              <div 
                key={ring.id} 
                className="glass-panel border-slate-800/80 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-500/20 transition-colors"
              >
                <div className="space-y-5">
                  {/* Title card */}
                  <div className="flex justify-between items-start border-b border-slate-800/60 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-pink-500" />
                        Fraud Cluster #{idx + 1}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">Cluster ID: {ring.id}</span>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">
                      {victims.length} Victims Linked
                    </span>
                  </div>

                  {/* Ring Entities Classifications */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">UPI Mules</span>
                        <div className="font-mono text-slate-300 font-medium">{upis.length || 0} handles</div>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Mule Accounts</span>
                        <div className="font-mono text-slate-300 font-medium">{banks.length || 0} accounts</div>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Device IDs</span>
                        <div className="font-mono text-slate-300 font-medium">{devices.length || 0} emulators</div>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Phone Links</span>
                        <div className="font-mono text-slate-300 font-medium">{phones.length || 0} numbers</div>
                      </div>
                    </div>

                    {/* Victims List preview */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Linked Victims</span>
                      <div className="flex flex-wrap gap-1.5">
                        {victims.map((name, i) => (
                          <div 
                            key={i} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded"
                          >
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shared entities preview */}
                    {(upis.length > 0 || devices.length > 0) && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/40 mt-2">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Primary Infrastructure Hubs</span>
                        <div className="space-y-1 text-xs text-slate-400">
                          {upis.slice(0, 1).map((upi, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Wallet className="w-3.5 h-3.5 text-yellow-500" />
                              <span className="font-mono text-yellow-500/90">{upi}</span>
                            </div>
                          ))}
                          {devices.slice(0, 1).map((dev, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                              <span className="font-mono text-rose-500/90">{dev}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Open Packet Button */}
                <div className="pt-6 mt-4 border-t border-slate-800/40">
                  <Link
                    href={`/intelligence?node=victim:${victims[0]}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/15 hover:bg-indigo-600/35 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 hover:text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Investigate Syndicate Network
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
