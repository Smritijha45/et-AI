import json
import networkx as nx
import os
import sys
import argparse
from graph_builder import build_graph_from_file

def analyze_fraud_graph(file_path, max_suspicious=20):
    """
    Analyzes the fraud connection graph and returns a dictionary with:
    - communities: List of detected Louvain communities
    - suspiciousNodes: Sorted list of high-risk infrastructure entities (non-victims)
    - graphStats: General graph-level metrics
    """
    # 1. Build the graph
    G = build_graph_from_file(file_path)
    
    if len(G) == 0:
        return {
            "communities": [],
            "suspiciousNodes": [],
            "graphStats": {
                "totalNodes": 0,
                "totalEdges": 0,
                "density": 0,
                "numberConnectedComponents": 0,
                "nodeTypeCounts": {}
            }
        }
    
    # 2. Compute Louvain Community Detection (using fixed seed for reproducibility)
    try:
        # networkx.community.louvain_communities returns a list of sets of nodes
        communities_sets = nx.community.louvain_communities(G, seed=42)
        communities = []
        for idx, com_set in enumerate(communities_sets):
            communities.append({
                "id": idx,
                "nodes": sorted(list(com_set))
            })
    except Exception as e:
        # Fallback to connected components if community detection fails
        communities = [{
            "id": idx,
            "nodes": sorted(list(c))
        } for idx, c in enumerate(nx.connected_components(G))]

    # 3. Compute PageRank
    pagerank_scores = nx.pagerank(G)
    
    # 4. Compute Betweenness Centrality
    betweenness_scores = nx.betweenness_centrality(G)
    
    # 5. Compute Degree Centrality
    degrees = dict(G.degree())
    
    # 6. Identify Suspicious Nodes (Focus on shared infrastructures like Phone, UPI, BankAccount, Device)
    suspicious_list = []
    
    for node, data in G.nodes(data=True):
        node_type = data.get('type')
        
        # We do not mark Victims as suspicious hubs (they are victims of the hubs)
        if node_type == "Victim":
            continue
            
        deg = degrees.get(node, 0)
        pr = pagerank_scores.get(node, 0.0)
        bc = betweenness_scores.get(node, 0.0)
        
        # A node is suspicious if it is shared by multiple victims (degree > 1)
        if deg > 1:
            suspicious_list.append({
                "nodeId": node,
                "type": node_type,
                "label": data.get('label'),
                "degree": deg,
                "pagerank": pr,
                "betweenness": bc
            })
            
    # Sort suspicious nodes: primary sort by degree (descending), secondary by pagerank (descending)
    suspicious_list.sort(key=lambda x: (x['degree'], x['pagerank']), reverse=True)
    suspicious_nodes = suspicious_list[:max_suspicious]
    
    # 7. Collect Graph Stats
    node_types = nx.get_node_attributes(G, 'type')
    node_type_counts = {}
    for t in node_types.values():
        node_type_counts[t] = node_type_counts.get(t, 0) + 1
        
    num_components = nx.number_connected_components(G)
    density = nx.density(G)
    
    graph_stats = {
        "totalNodes": G.number_of_nodes(),
        "totalEdges": G.number_of_edges(),
        "density": density,
        "numberConnectedComponents": num_components,
        "nodeTypeCounts": node_type_counts
    }
    
    return {
        "communities": communities,
        "suspiciousNodes": suspicious_nodes,
        "graphStats": graph_stats
    }

def main():
    parser = argparse.ArgumentParser(description="Analyze fraud report network graph.")
    parser.add_argument(
        "--file", 
        type=str, 
        help="Path to the synthetic reports JSON file",
        default=os.path.join(os.path.dirname(__file__), "synthetic_reports.json")
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Path to write analysis output JSON file (optional)"
    )
    
    args = parser.parse_args()
    
    try:
        results = analyze_fraud_graph(args.file)
        json_output = json.dumps(results, indent=2)
        
        if args.output:
            with open(args.output, 'w') as f:
                f.write(json_output)
            print(f"Analysis written to: {args.output}")
        else:
            # Print to stdout
            print(json_output)
            
    except Exception as e:
        print(f"Error executing analysis: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
