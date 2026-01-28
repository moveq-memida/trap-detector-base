'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { AnalyzeMode, Language } from '@/types';

interface CyberPlaygroundTabsProps {
  onAnalyze: (mode: AnalyzeMode, data: Record<string, unknown>) => Promise<void>;
  lang?: Language;
  loading?: boolean;
}

const TABS: Array<{ id: AnalyzeMode; label: string; icon: string }> = [
  { id: 'calldata', label: 'CALLDATA', icon: '{ }' },
  { id: 'typedData', label: 'TYPED_DATA', icon: '712' },
  { id: 'approval', label: 'SIMULATE', icon: '⚡' },
];

export function CyberPlaygroundTabs({ onAnalyze, lang = 'ja', loading }: CyberPlaygroundTabsProps) {
  const [activeTab, setActiveTab] = useState<AnalyzeMode>('calldata');
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Form states
  const [calldataForm, setCalldataForm] = useState({ to: '', calldata: '' });
  const [typedDataForm, setTypedDataForm] = useState({ typedData: '' });
  const [approvalForm, setApprovalForm] = useState({ token: '', spender: '', amount: '', unlimited: false });

  useEffect(() => {
    if (!tabsRef.current || !indicatorRef.current) return;
    const activeButton = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLButtonElement;
    if (activeButton) {
      gsap.to(indicatorRef.current, {
        x: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [activeTab]);

  const handleSubmit = async () => {
    switch (activeTab) {
      case 'calldata':
        await onAnalyze('calldata', {
          to: calldataForm.to || undefined,
          calldata: calldataForm.calldata,
        });
        break;
      case 'typedData':
        try {
          const parsed = JSON.parse(typedDataForm.typedData);
          await onAnalyze('typedData', { typedData: parsed });
        } catch {
          alert('Invalid JSON format');
        }
        break;
      case 'approval':
        await onAnalyze('approval', {
          token: approvalForm.token,
          spender: approvalForm.spender,
          amount: approvalForm.unlimited ? 'unlimited' : approvalForm.amount,
        });
        break;
    }
  };

  return (
    <div className="tabs-container">
        <div className="tabs-header" ref={tabsRef}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <div className="tabs-indicator" ref={indicatorRef} />
        </div>

        <div className="tab-content">
          {activeTab === 'calldata' && (
            <>
              <div className="tabs-form-group">
                <label className="tabs-form-label">TARGET_ADDRESS</label>
                <input
                  type="text"
                  value={calldataForm.to}
                  onChange={(e) => setCalldataForm({ ...calldataForm, to: e.target.value })}
                  placeholder="0x..."
                  className="tabs-form-input"
                />
              </div>
              <div className="tabs-form-group">
                <label className="tabs-form-label">CALLDATA_HEX</label>
                <textarea
                  value={calldataForm.calldata}
                  onChange={(e) => setCalldataForm({ ...calldataForm, calldata: e.target.value })}
                  placeholder="0x095ea7b3..."
                  className="tabs-form-input tabs-form-textarea"
                />
              </div>
            </>
          )}

          {activeTab === 'typedData' && (
            <div className="tabs-form-group">
              <label className="tabs-form-label">EIP712_TYPED_DATA_JSON</label>
              <textarea
                value={typedDataForm.typedData}
                onChange={(e) => setTypedDataForm({ typedData: e.target.value })}
                placeholder='{"types": {...}, "domain": {...}, "message": {...}}'
                className="tabs-form-input tabs-form-textarea"
                style={{ minHeight: '200px' }}
              />
            </div>
          )}

          {activeTab === 'approval' && (
            <>
              <div className="tabs-form-group">
                <label className="tabs-form-label">TOKEN_CONTRACT</label>
                <input
                  type="text"
                  value={approvalForm.token}
                  onChange={(e) => setApprovalForm({ ...approvalForm, token: e.target.value })}
                  placeholder="0x833589..."
                  className="tabs-form-input"
                />
              </div>
              <div className="tabs-form-group">
                <label className="tabs-form-label">SPENDER_ADDRESS</label>
                <input
                  type="text"
                  value={approvalForm.spender}
                  onChange={(e) => setApprovalForm({ ...approvalForm, spender: e.target.value })}
                  placeholder="0xDef1C0..."
                  className="tabs-form-input"
                />
              </div>
              <div className="tabs-form-group">
                <label className="tabs-form-label">APPROVAL_AMOUNT</label>
                <input
                  type="text"
                  value={approvalForm.amount}
                  onChange={(e) => setApprovalForm({ ...approvalForm, amount: e.target.value })}
                  placeholder="1000000000000000000"
                  className="tabs-form-input"
                  disabled={approvalForm.unlimited}
                  style={{ opacity: approvalForm.unlimited ? 0.5 : 1 }}
                />
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={approvalForm.unlimited}
                    onChange={(e) => setApprovalForm({ ...approvalForm, unlimited: e.target.checked })}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label">⚠ UNLIMITED (MAX_UINT256)</span>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <span className="loading-text">
                <span className="loading-spinner" />
                SCANNING...
              </span>
            ) : (
              '[ EXECUTE SCAN ]'
            )}
          </button>
        </div>
      </div>
  );
}
