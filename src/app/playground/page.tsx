'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import type { AnalyzeMode, AnalyzeResponse, Language } from '@/types';
import { CyberBackground } from '@/components/CyberBackground';
import { CyberPlaygroundTabs } from '@/components/CyberPlaygroundTabs';
import { CyberResultDisplay } from '@/components/CyberResultDisplay';

export default function PlaygroundPage() {
  const [lang, setLang] = useState<Language>('en');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate header
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // Animate content
    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });
    }
  }, []);

  const handleAnalyze = async (mode: AnalyzeMode, data: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, data, lang }),
      });

      if (response.status === 402) {
        setError('PAYMENT_REQUIRED: x402 protocol payment needed');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const resultData = await response.json();
      setResult(resultData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CyberBackground />
      <div className="scanlines" />

      <div className="playground-container">
        {/* Header */}
        <header className="playground-header" ref={headerRef}>
          <div className="header-left">
            <Link href="/" className="logo">
              {'<TD/>'}
            </Link>
            <div className="breadcrumb">
              <span>ROOT</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">PLAYGROUND</span>
            </div>
          </div>
          <div className="header-right">
            <div className="status-indicator">
              <div className="status-dot" />
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="playground-main">
          <div className="page-title">
            <div className="title-label">{'// ANALYSIS_INTERFACE'}</div>
            <h1 className="title-main">
              TRAP <span>SCANNER</span>
            </h1>
          </div>

          <div className="content-grid" ref={contentRef}>
            {/* Input Panel */}
            <div className="content-panel">
              <div className="panel-header">
                <div className="panel-icon">IN</div>
                <div className="panel-title">INPUT_DATA</div>
              </div>
              <CyberPlaygroundTabs
                onAnalyze={handleAnalyze}
                lang={lang}
                loading={loading}
              />
            </div>

            {/* Result Panel */}
            <div className="content-panel">
              <div className="panel-header">
                <div className="panel-icon">OUT</div>
                <div className="panel-title">SCAN_RESULTS</div>
              </div>
              {!result && !loading && !error ? (
                <div className="empty-state">
                  <div className="empty-icon">⬡</div>
                  <div className="empty-text">
                    DROP YOUR DATA AND HIT SCAN
                  </div>
                </div>
              ) : (
                <CyberResultDisplay
                  result={result}
                  loading={loading}
                  error={error}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </main>

        {/* Disclaimer Bar */}
        <div className="disclaimer-bar">
          <span className="disclaimer-icon">⚠</span>
          <span className="disclaimer-text">
            Not financial advice. Always DYOR. You sign, you own it.
          </span>
        </div>
      </div>
    </>
  );
}
