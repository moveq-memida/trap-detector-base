'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CyberBackground } from '@/components/CyberBackground';
import { GlitchText } from '@/components/GlitchText';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animations
    const heroTl = gsap.timeline();

    heroTl
      .from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      })
      .from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      }, '-=0.5')
      .from('.hero-desc', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.5')
      .from('.hero-buttons', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.3')
      .from('.hero-stats', {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      }, '-=0.3');

    // Features animation
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 80%',
      },
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
    });

    // Terminal typing effect
    if (terminalRef.current) {
      const lines = terminalRef.current.querySelectorAll('.terminal-line');
      gsap.from(lines, {
        scrollTrigger: {
          trigger: terminalRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }

    // Pricing card
    gsap.from('.pricing-card', {
      scrollTrigger: {
        trigger: pricingRef.current,
        start: 'top 80%',
      },
      scale: 0.8,
      opacity: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.5)',
    });

    // Risk badges animation
    gsap.from('.risk-badge', {
      scrollTrigger: {
        trigger: '.risk-section',
        start: 'top 80%',
      },
      x: -50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      <CyberBackground />
      <div className="scanlines" />

      <div className="page-container">
        {/* Navigation */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-full">{'<TRAP_DETECTOR/>'}</span>
            <span className="nav-logo-short">{'<TD/>'}</span>
          </Link>
          <div className="nav-links">
            <Link href="#features" className="nav-link">FEATURES</Link>
            <Link href="#api" className="nav-link">API</Link>
            <Link href="#pricing" className="nav-link">PRICING</Link>
            <Link href="/playground" className="cyber-button">
              LAUNCH
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero" ref={heroRef}>
          <div className="hero-content">
            <div className="hero-subtitle">
              {'// BLOCKCHAIN SECURITY PROTOCOL'}
            </div>
            <h1 className="hero-title">
              <GlitchText text="TRAP DETECTOR" as="span" />
            </h1>
            <p className="hero-desc">
              Stop wallet drainers before they strike. Real-time signature analysis
              that catches malicious transactions and keeps your assets safe. Built for Base.
            </p>
            <div className="hero-buttons">
              <Link href="/playground" className="cyber-button cyber-button--primary">
                START SCANNING
              </Link>
              <a href="#features" className="cyber-button">
                LEARN MORE
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item hero-stats">
                <div className="stat-value">8+</div>
                <div className="stat-label">RISK PATTERNS</div>
              </div>
              <div className="stat-item hero-stats">
                <div className="stat-value">$0.05</div>
                <div className="stat-label">PER ANALYSIS</div>
              </div>
              <div className="stat-item hero-stats">
                <div className="stat-value">x402</div>
                <div className="stat-label">PROTOCOL</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section" id="features" ref={featuresRef}>
          <div className="section-title">
            <span className="section-label">// CAPABILITIES</span>
            <h2 style={{ color: 'var(--cyber-cyan)', textShadow: '0 0 30px var(--cyber-cyan)' }}>
              DETECTION MODULES
            </h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <h3 className="feature-title">CALLDATA DECODER</h3>
              <p className="feature-desc">
                Decodes approve(), setApprovalForAll() and other function calls.
                Exposes hidden malicious parameters scammers try to sneak past you.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h3 className="feature-title">EIP-712 ANALYZER</h3>
              <p className="feature-desc">
                Parses TypedData signature requests to detect permit scams
                and domain spoofing attacks before you sign.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="feature-title">RISK ASSESSMENT</h3>
              <p className="feature-desc">
                Catches 8+ risk patterns and flags threats as Critical, High, or Medium.
                Know exactly what you're signing before you sign it.
              </p>
            </div>
          </div>

          {/* Risk Patterns */}
          <div className="risk-section">
            <div className="section-title" style={{ marginTop: '80px' }}>
              <span className="section-label">// THREAT DATABASE</span>
              <h3 style={{ color: 'var(--cyber-white)', fontSize: '24px' }}>
                DETECTED RISK PATTERNS
              </h3>
            </div>
            <div className="risk-grid">
              <div className="risk-badge critical">
                <span>●</span> UNLIMITED_APPROVAL
              </div>
              <div className="risk-badge critical">
                <span>●</span> APPROVAL_FOR_ALL
              </div>
              <div className="risk-badge high">
                <span>●</span> UNKNOWN_CONTRACT
              </div>
              <div className="risk-badge high">
                <span>●</span> DOMAIN_MISMATCH
              </div>
              <div className="risk-badge high">
                <span>●</span> PERMIT_TO_UNKNOWN
              </div>
              <div className="risk-badge medium">
                <span>●</span> HIGH_VALUE_APPROVAL
              </div>
              <div className="risk-badge medium">
                <span>●</span> EOA_SPENDER
              </div>
              <div className="risk-badge medium">
                <span>●</span> UNCLEAR_INTENT
              </div>
            </div>
          </div>
        </section>

        {/* API Section */}
        <section className="section" id="api">
          <div className="section-title">
            <span className="section-label">// INTEGRATION</span>
            <h2 style={{ color: 'var(--cyber-cyan)', textShadow: '0 0 30px var(--cyber-cyan)' }}>
              API INTERFACE
            </h2>
          </div>
          <div className="terminal" ref={terminalRef}>
            <div className="terminal-header">
              <div className="terminal-dot" style={{ background: '#ff5f56' }} />
              <div className="terminal-dot" style={{ background: '#ffbd2e' }} />
              <div className="terminal-dot" style={{ background: '#27ca40' }} />
              <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--cyber-gray-light)' }}>
                terminal — POST /api/v1/analyze
              </span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command">curl -X POST /api/v1/analyze</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`{`}</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`  "mode": "approval",`}</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`  "data": {`}</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`    "token": "0x833589...",`}</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`    "spender": "0xDef1C0...",`}</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`    "amount": "unlimited"`}</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`  }`}</span>
              </div>
              <div className="terminal-line terminal-output">
                <span className="terminal-json">{`}`}</span>
              </div>
              <div className="terminal-line" style={{ marginTop: '15px' }}>
                <span style={{ color: 'var(--cyber-green)' }}>→</span>
                <span style={{ color: 'var(--cyber-red)' }}>CRITICAL: UNLIMITED_APPROVAL detected</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="section" id="pricing" ref={pricingRef}>
          <div className="section-title">
            <span className="section-label">// PRICING</span>
            <h2 style={{ color: 'var(--cyber-cyan)', textShadow: '0 0 30px var(--cyber-cyan)' }}>
              ACCESS PROTOCOL
            </h2>
          </div>
          <div className="pricing-card">
            <div className="pricing-label">PAY PER SCAN</div>
            <div className="pricing-amount">$0.05</div>
            <div className="pricing-per">/ per analysis</div>
            <div className="pricing-features">
              <div className="pricing-feature">
                <div className="pricing-check">✓</div>
                <span>Full calldata decoding</span>
              </div>
              <div className="pricing-feature">
                <div className="pricing-check">✓</div>
                <span>EIP-712 TypedData analysis</span>
              </div>
              <div className="pricing-feature">
                <div className="pricing-check">✓</div>
                <span>8+ threat pattern detection</span>
              </div>
              <div className="pricing-feature">
                <div className="pricing-check">✓</div>
                <span>Instant risk assessment</span>
              </div>
              <div className="pricing-feature">
                <div className="pricing-check">✓</div>
                <span>x402 instant payments</span>
              </div>
            </div>
            <Link href="/playground" className="cyber-button cyber-button--primary" style={{ width: '100%' }}>
              START NOW
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <a
            href="https://orynth.dev/projects/trap-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-badge"
          >
            <img
              src="https://orynth.dev/api/badge/trap-detector?theme=dark&style=minimal"
              alt="Featured on Orynth"
              width="180"
              height="48"
            />
          </a>
          <p className="footer-text" style={{ marginTop: '20px' }}>
            {'[ '}<span className="footer-highlight">TRAP_DETECTOR</span>{' ]'} — BUILT FOR <span className="footer-highlight">BASE</span>
          </p>
          <p className="footer-text footer-text-dim" style={{ marginTop: '10px' }}>
            POWERED BY x402 PROTOCOL
          </p>
        </footer>
      </div>
    </>
  );
}
