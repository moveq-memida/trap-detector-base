'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import type { AnalyzeMetrics } from '@/types';
import { CyberBackground } from '@/components/CyberBackground';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<AnalyzeMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('admin_auth');
    if (session === 'true') {
      setAuthenticated(true);
      fetchMetrics();
    }
  }, []);

  useEffect(() => {
    if (loginRef.current && !authenticated) {
      gsap.from(loginRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
    }
    if (dashboardRef.current && authenticated) {
      gsap.from(dashboardRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }, [authenticated]);

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
    if (password === adminPassword) {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
      fetchMetrics();
    } else {
      setError('ACCESS_DENIED: Invalid credentials');
      // Shake animation
      const tl = gsap.timeline();
      tl.to(loginRef.current, { x: -10, duration: 0.08 })
        .to(loginRef.current, { x: 10, duration: 0.08 })
        .to(loginRef.current, { x: -10, duration: 0.08 })
        .to(loginRef.current, { x: 10, duration: 0.08 })
        .to(loginRef.current, { x: 0, duration: 0.08 });
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setMetrics(null);
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Mock metrics for demo
      const mockMetrics: AnalyzeMetrics = {
        totalRequests: Math.floor(Math.random() * 1000),
        requestsByMode: {
          calldata: Math.floor(Math.random() * 400),
          typedData: Math.floor(Math.random() * 300),
          approval: Math.floor(Math.random() * 300),
        },
        requestsByLang: {
          ja: Math.floor(Math.random() * 600),
          en: Math.floor(Math.random() * 400),
        },
        riskSignalCounts: {
          UNLIMITED_APPROVAL: Math.floor(Math.random() * 200),
          APPROVAL_FOR_ALL_TRUE: Math.floor(Math.random() * 150),
          UNKNOWN_SPENDER_CONTRACT: Math.floor(Math.random() * 100),
          TYPEDDATA_DOMAIN_MISMATCH: Math.floor(Math.random() * 80),
          UNCLEAR_INTENT: Math.floor(Math.random() * 60),
          PERMIT_TO_UNKNOWN: Math.floor(Math.random() * 50),
          HIGH_VALUE_APPROVAL: Math.floor(Math.random() * 40),
          EOA_SPENDER: Math.floor(Math.random() * 30),
        },
        recentRequests: Array.from({ length: 10 }, (_, i) => ({
          timestamp: Date.now() - i * 60000 * Math.random() * 10,
          mode: ['calldata', 'typedData', 'approval'][Math.floor(Math.random() * 3)] as AnalyzeMetrics['recentRequests'][0]['mode'],
          riskCount: Math.floor(Math.random() * 4),
        })),
      };
      setMetrics(mockMetrics);
    } catch (e) {
      console.error('Failed to fetch metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CyberBackground />
      <div className="scanlines" />

      <div className="admin-container">
        {!authenticated ? (
          <div className="login-page">
            <div className="login-box" ref={loginRef}>
              <div className="login-header">
                <div className="login-icon">⬡</div>
                <h1 className="login-title">ADMIN ACCESS</h1>
                <div className="login-subtitle">AUTHORIZATION REQUIRED</div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <div className="login-form">
                <div>
                  <label className="form-label">PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="form-input"
                    placeholder="Enter access code"
                  />
                </div>
                <button onClick={handleLogin} className="login-button">
                  AUTHENTICATE
                </button>
              </div>

              <Link href="/" className="back-link">
                {'< RETURN TO MAIN'}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <header className="admin-header">
              <div className="header-left">
                <Link href="/" className="logo">{'<TD/>'}</Link>
                <div className="admin-badge">ADMIN_PANEL</div>
              </div>
              <div className="header-actions">
                <button onClick={fetchMetrics} disabled={loading} className="action-button">
                  {loading ? 'LOADING...' : 'REFRESH'}
                </button>
                <button onClick={handleLogout} className="action-button danger">
                  LOGOUT
                </button>
              </div>
            </header>

            <main className="dashboard-main" ref={dashboardRef}>
              <div className="dashboard-title">
                <div className="title-label">{'// SYSTEM_METRICS'}</div>
                <h1 className="title-main">DASHBOARD</h1>
              </div>

              {metrics && (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-label">TOTAL_REQUESTS</div>
                      <div className="stat-value">{metrics.totalRequests}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">REQUESTS_1H</div>
                      <div className="stat-value">
                        {metrics.recentRequests.filter(r => r.timestamp > Date.now() - 3600000).length}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">AVG_RISKS</div>
                      <div className="stat-value">
                        {metrics.recentRequests.length > 0
                          ? (metrics.recentRequests.reduce((a, b) => a + b.riskCount, 0) / metrics.recentRequests.length).toFixed(1)
                          : '0'}
                      </div>
                    </div>
                  </div>

                  <div className="panels-grid">
                    <div className="panel">
                      <div className="panel-header">REQUESTS_BY_MODE</div>
                      <div className="panel-content">
                        <div className="bar-chart">
                          {Object.entries(metrics.requestsByMode).map(([mode, count]) => (
                            <div key={mode} className="bar-item">
                              <div className="bar-label">
                                <span>{mode.toUpperCase()}</span>
                                <span>{count}</span>
                              </div>
                              <div className="bar-track">
                                <div
                                  className="bar-fill"
                                  style={{ width: `${(count / metrics.totalRequests) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="panel">
                      <div className="panel-header">TOP_RISKS_DETECTED</div>
                      <div className="panel-content">
                        <div className="risk-list">
                          {Object.entries(metrics.riskSignalCounts)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([id, count]) => (
                              <div key={id} className="risk-item">
                                <span className="risk-name">{id}</span>
                                <span className="risk-count">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="panel" style={{ gridColumn: '1 / -1' }}>
                      <div className="panel-header">RECENT_ACTIVITY</div>
                      <div className="panel-content">
                        <table className="recent-table">
                          <thead>
                            <tr>
                              <th>TIMESTAMP</th>
                              <th>MODE</th>
                              <th>RISKS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {metrics.recentRequests.map((req, idx) => (
                              <tr key={idx}>
                                <td>{new Date(req.timestamp).toLocaleTimeString()}</td>
                                <td>
                                  <span className={`mode-badge mode-${req.mode}`}>
                                    {req.mode.toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ color: req.riskCount > 0 ? 'var(--cyber-red)' : 'var(--cyber-green)' }}>
                                  {req.riskCount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </main>
          </>
        )}
      </div>
    </>
  );
}
