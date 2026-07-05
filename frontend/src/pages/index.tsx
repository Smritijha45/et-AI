import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Fraud Network Graph Intelligence Dashboard</title>
        <meta name="description" content="Module 3: Fraud Network Graph Intelligence Dashboard - Backend Architecture API Hub" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="main">
        {/* Glow Effects */}
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>

        {/* Header */}
        <header className="header">
          <div className="logo-section">
            <span className="logo-dot"></span>
            <h1 className="logo-text">et-AI Intelligence</h1>
          </div>
          <div className="badge">Module 3: Active</div>
        </header>

        {/* Main Content */}
        <div className="content-grid">
          {/* Left Column - Intro & Mock Stats */}
          <div className="card hero-card">
            <h2 className="title-gradient">Fraud Network Graph</h2>
            <p className="subtitle">
              A graph-database powered analyzer for detecting multi-hop relationships between reported victims, device fingerprints, phone numbers, and bank entities.
            </p>
            
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-num">0</span>
                <span className="stat-label">Reports Logged</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">0</span>
                <span className="stat-label">Linked Entities</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">0</span>
                <span className="stat-label">Risk Clusters</span>
              </div>
            </div>

            {/* Simulated Graph Preview */}
            <div className="graph-preview">
              <div className="node center-node">Victim</div>
              <div className="node node-1">Phone</div>
              <div className="node node-2">UPI</div>
              <div className="node node-3">Bank</div>
              <div className="line line-1"></div>
              <div className="line line-2"></div>
              <div className="line line-3"></div>
            </div>
          </div>

          {/* Right Column - API Documentation & Placeholders */}
          <div className="card api-card">
            <h3>REST API Documentation</h3>
            <p className="card-description">Verify the current state of CRUD APIs implemented in the Node.js/Express backend.</p>

            <div className="api-list">
              <div className="api-item">
                <span className="method post">POST</span>
                <span className="route">/api/report</span>
                <span className="desc">Log a new fraud report payload</span>
              </div>
              
              <div className="api-item">
                <span className="method get">GET</span>
                <span className="route">/api/report</span>
                <span className="desc">Retrieve all logged fraud reports</span>
              </div>

              <div className="api-item">
                <span className="method get">GET</span>
                <span className="route">/api/report/:id</span>
                <span className="desc">Get report details by MongoDB ID / Victim ID</span>
              </div>

              <div className="api-item">
                <span className="method delete">DELETE</span>
                <span className="route">/api/report/:id</span>
                <span className="desc">Remove a report record permanently</span>
              </div>
            </div>

            <div className="integration-status">
              <div className="status-header">
                <span>Database Connection Status</span>
                <span className="status-tag online">Ready</span>
              </div>
              <div className="schema-info">
                <h4>Required Fields:</h4>
                <code>{`{ victimId: String, victimName: String }`}</code>
                <h4>Optional Association Fields:</h4>
                <code>{`{ phoneNumber, upiId, bankAccount, deviceFingerprint }`}</code>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        :root {
          --bg-dark: #0a0e1a;
          --card-bg: rgba(16, 22, 42, 0.65);
          --border-color: rgba(255, 255, 255, 0.08);
          --accent-primary: #6366f1;
          --accent-secondary: #ec4899;
          --text-primary: #f3f4f6;
          --text-secondary: #9ca3af;
          --success: #10b981;
          --error: #ef4444;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background-color: var(--bg-dark);
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .container {
          position: relative;
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Glow effects for modern visual appeal */
        .glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }

        .glow-1 {
          background: var(--accent-primary);
          top: -100px;
          left: -100px;
        }

        .glow-2 {
          background: var(--accent-secondary);
          bottom: -100px;
          right: -100px;
        }

        .main {
          width: 100%;
          max-width: 1200px;
          z-index: 1;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 0 15px var(--accent-primary);
        }

        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .badge {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: var(--card-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          transform: translateY(-2px);
        }

        .hero-card {
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(16, 22, 42, 0.8), rgba(8, 10, 20, 0.9));
        }

        .title-gradient {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #a5b4fc, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .stat-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.25rem 0.75rem;
          text-align: center;
          transition: background 0.2s ease;
        }

        .stat-box:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-num {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Mock Graph Aesthetics */
        .graph-preview {
          position: relative;
          height: 160px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node {
          position: absolute;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          backdrop-filter: blur(5px);
        }

        .center-node {
          background: linear-gradient(135deg, var(--accent-primary), #4f46e5);
          color: #fff;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
          z-index: 2;
        }

        .node-1 {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          top: 20px;
          left: 40px;
        }

        .node-2 {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          bottom: 20px;
          left: 60px;
        }

        .node-3 {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          right: 50px;
          top: 45px;
        }

        .line {
          position: absolute;
          background: rgba(99, 102, 241, 0.2);
          height: 2px;
          transform-origin: left center;
          z-index: 1;
        }

        .line-1 {
          width: 90px;
          transform: rotate(-35deg);
          top: 75px;
          left: 100px;
        }

        .line-2 {
          width: 80px;
          transform: rotate(35deg);
          top: 85px;
          left: 110px;
        }

        .line-3 {
          width: 100px;
          transform: rotate(-10deg);
          top: 80px;
          left: 160px;
        }

        .api-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .card-description {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .api-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .api-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .method {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          min-width: 65px;
          text-align: center;
        }

        .method.post {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .method.get {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .method.delete {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .route {
          font-family: monospace;
          color: #f3f4f6;
          font-weight: 600;
        }

        .desc {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-left: auto;
        }

        .integration-status {
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .status-tag {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
        }

        .status-tag.online {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .schema-info h4 {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.35rem;
          margin-top: 0.75rem;
        }

        .schema-info code {
          display: block;
          font-family: monospace;
          background: #060913;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #c084fc;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </div>
  );
}
