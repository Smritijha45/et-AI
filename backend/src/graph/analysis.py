import json
import networkx as nx
import os
import sys
import argparse
from graph_builder import build_graph_from_file

def analyze_fraud_graph(file_path):
    """
    Analyzes the fraud connection graph and returns a dictionary with:
    - communities: List of detected Louvain communities
    - centrality: Dict of node importance scores (PageRank and Betweenness Centrality)
    - graph stats: General graph-level metrics
    - confidence scores: Calculated fraud likelihood (0.0 to 1.0) for shared entity hubs
    """
    # 1. Build the graph
    G = build_graph_from_file(file_path)
    
    if len(G) == 0:
        return {
            "communities": [],
            "centrality": {
                "pagerank": {},
                "betweenness": {}
            },
            "graph stats": {
                "totalNodes": 0,
                "totalEdges": 0,
                "density": 0.0,
                "numberConnectedComponents": 0,
                "nodeTypeCounts": {}
            },
            "confidence scores": {}
        }
    
    # 2. Compute Louvain Community Detection (with seed for deterministic results)
    try:
        communities_sets = nx.community.louvain_communities(G, seed=42)
        communities = []
        for idx, com_set in enumerate(communities_sets):
            communities.append({
                "id": idx,
                "nodes": sorted(list(com_set))
            })
    except Exception:
        # Fallback to connected components
        communities = [{
            "id": idx,
            "nodes": sorted(list(c))
        } for idx, c in enumerate(nx.connected_components(G))]

    # 3. Compute PageRank Centrality
    pagerank_scores = nx.pagerank(G)
    
    # 4. Compute Betweenness Centrality
    betweenness_scores = nx.betweenness_centrality(G)
    
    # 5. Compute Degree Centrality (for confidence calculations)
    degrees = dict(G.degree())
    
    # 6. Calculate Confidence Scores
    # Only calculate confidence for non-victim infrastructure entities that are shared (degree > 1)
    confidence_scores = {}
    for node, data in G.nodes(data=True):
        node_type = data.get('type')
        if node_type == "Victim":
            continue
            
        deg = degrees.get(node, 0)
        if deg > 1:
            # Formula: 1.0 - (1.0 / degree)
            # E.g. shared by 2 victims -> 0.50; by 5 victims -> 0.80; by 20 victims -> 0.95
            confidence = 1.0 - (1.0 / deg)
            confidence_scores[node] = round(confidence, 3)

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
        "centrality": {
            "pagerank": pagerank_scores,
            "betweenness": betweenness_scores
        },
        "graph stats": graph_stats,
        "confidence scores": confidence_scores
    }

def main():
    parser = argparse.ArgumentParser(description="Analyze fraud report network graph.")
    parser.add_argument(
        "--file", 
        type=str, 
        help="Path to the reports JSON file",
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
