'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { AnalyzeResponse, RiskSignal } from '@/types';
import { HexagonLoader } from './HexagonLoader';

interface CyberResultDisplayProps {
  result: AnalyzeResponse | null;
  loading?: boolean;
  error?: string | null;
  lang?: 'ja' | 'en';
}

const SEVERITY_CONFIG: Record<RiskSignal['severity'], { color: string; bg: string; label: string }> = {
  critical: { color: '#ff0040', bg: 'rgba(255, 0, 64, 0.1)', label: 'CRITICAL' },
  high: { color: '#ff6600', bg: 'rgba(255, 102, 0, 0.1)', label: 'HIGH' },
  medium: { color: '#f0ff00', bg: 'rgba(240, 255, 0, 0.1)', label: 'MEDIUM' },
  low: { color: '#0066ff', bg: 'rgba(0, 102, 255, 0.1)', label: 'LOW' },
  info: { color: '#4a4a5a', bg: 'rgba(74, 74, 90, 0.1)', label: 'INFO' },
};

export function CyberResultDisplay({ result, loading, error, lang = 'en' }: CyberResultDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result || !containerRef.current) return;

    const sections = containerRef.current.querySelectorAll('.result-section');
    gsap.from(sections, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
    });

    // Animate risk signals
    const riskItems = containerRef.current.querySelectorAll('.risk-item');
    gsap.from(riskItems, {
      x: -30,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.3,
    });
  }, [result]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: 'linear-gradient(135deg, rgba(13, 13, 21, 0.95) 0%, rgba(6, 6, 10, 0.98) 100%)',
        border: '1px solid var(--cyber-gray)',
      }}>
        <HexagonLoader text="SCANNING" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '30px',
        background: 'rgba(255, 0, 64, 0.1)',
        border: '1px solid var(--cyber-red)',
        color: 'var(--cyber-red)',
        fontFamily: 'var(--font-mono)',
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.2em', marginBottom: '10px' }}>
          {'// ERROR'}
        </div>
        <div>{error}</div>
      </div>
    );
  }

  if (!result) return null;

  const hasHighRisks = result.riskSignals.some(r => r.severity === 'critical' || r.severity === 'high');

  return (
    <div className="result-container" ref={containerRef}>
        {/* Summary Section */}
        <div className="result-section">
          <div className="section-header">
            <div className="section-icon">Σ</div>
            <div className="section-title">SUMMARY</div>
          </div>
          <div className="summary-box" style={{
            borderLeft: `4px solid ${hasHighRisks ? 'var(--cyber-red)' : 'var(--cyber-green)'}`,
            background: hasHighRisks ? 'rgba(255, 0, 64, 0.05)' : 'rgba(0, 255, 65, 0.05)',
          }}>
            <div className="summary-status" style={{
              color: hasHighRisks ? 'var(--cyber-red)' : 'var(--cyber-green)',
            }}>
              {hasHighRisks ? '⚠ THREAT DETECTED' : '✓ SCAN COMPLETE'}
            </div>
            <div className="summary-text">{result.summary}</div>
          </div>
        </div>

        {/* Decoded Details Section */}
        {result.decodedDetails && (
          <div className="result-section">
            <div className="section-header">
              <div className="section-icon">{'{}'}</div>
              <div className="section-title">DECODED_DATA</div>
            </div>
            <div className="section-content">
              <div className="code-block">
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(result.decodedDetails, null, 2)
                    .split('\n')
                    .map((line, i) => (
                      <div key={i}>
                        {line.replace(/"([^"]+)":/g, '<span class="code-key">"$1"</span>:')
                          .replace(/: "([^"]+)"/g, ': <span class="code-string">"$1"</span>')
                          .replace(/: (\d+)/g, ': <span class="code-value">$1</span>')
                          .split(/(<span[^>]*>[^<]*<\/span>)/)
                          .map((part, j) =>
                            part.startsWith('<span') ? (
                              <span key={j} dangerouslySetInnerHTML={{ __html: part }} />
                            ) : (
                              <span key={j} style={{ color: 'var(--cyber-gray-light)' }}>{part}</span>
                            )
                          )}
                      </div>
                    ))}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Risk Signals Section */}
        <div className="result-section">
          <div className="section-header">
            <div className="section-icon" style={{
              borderColor: hasHighRisks ? 'var(--cyber-red)' : 'var(--cyber-green)',
              color: hasHighRisks ? 'var(--cyber-red)' : 'var(--cyber-green)',
            }}>!</div>
            <div className="section-title" style={{
              color: hasHighRisks ? 'var(--cyber-red)' : 'var(--cyber-green)',
            }}>
              RISK_SIGNALS [{result.riskSignals.length}]
            </div>
          </div>
          <div className="section-content">
            {result.riskSignals.length === 0 ? (
              <div className="no-risks">
                <span style={{ fontSize: '24px' }}>✓</span>
                <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                  NO THREATS DETECTED
                </span>
              </div>
            ) : (
              result.riskSignals.map((signal, idx) => {
                const config = SEVERITY_CONFIG[signal.severity];
                return (
                  <div
                    key={idx}
                    className="risk-item"
                    style={{
                      background: config.bg,
                      borderLeft: `4px solid ${config.color}`,
                    }}
                  >
                    <div className="corner-decoration corner-tl" style={{ borderColor: config.color }} />
                    <div className="corner-decoration corner-br" style={{ borderColor: config.color }} />
                    <div className="risk-header">
                      <div className="result-risk-badge" style={{ background: config.color, color: '#000' }}>
                        {config.label}
                      </div>
                      <div className="risk-title" style={{ color: config.color }}>
                        {signal.title}
                      </div>
                    </div>
                    <div className="risk-desc">{signal.description}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recommended Checks Section */}
        <div className="result-section">
          <div className="section-header">
            <div className="section-icon">✓</div>
            <div className="section-title">RECOMMENDED_ACTIONS</div>
          </div>
          <div className="section-content">
            <ul className="check-list">
              {result.recommendedChecks.map((check, idx) => (
                <li key={idx} className="check-item">
                  <span className="check-icon">[{String(idx + 1).padStart(2, '0')}]</span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Safe Alternatives Section */}
        <div className="result-section">
          <div className="section-header">
            <div className="section-icon" style={{ borderColor: 'var(--cyber-green)', color: 'var(--cyber-green)' }}>⚡</div>
            <div className="section-title" style={{ color: 'var(--cyber-green)' }}>SAFE_ALTERNATIVES</div>
          </div>
          <div className="section-content">
            <ul className="check-list">
              {result.safeAlternatives.map((alt, idx) => (
                <li key={idx} className="check-item">
                  <span className="check-icon" style={{ color: 'var(--cyber-green)' }}>→</span>
                  <span>{alt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Share Section */}
        <div className="result-section">
          <div className="section-header">
            <div className="section-icon">⬡</div>
            <div className="section-title">SHARE_REPORT</div>
          </div>
          <div className="section-content">
            <button
              className="share-button"
              onClick={() => {
                const text = encodeURIComponent(result.shareDrafts.twitter);
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
              }}
            >
              <span className="share-icon">𝕏</span>
              POST TO X (TWITTER)
            </button>
          </div>
        </div>
    </div>
  );
}
