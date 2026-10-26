import React from 'react';
import {
  IconBookOpen,
  IconSun,
  IconMoon,
  IconCpu,
  IconActivity,
} from './Icons';

export default function Header({
  wsStatus,
  mpReady,
  mpLoading,
  latency,
  serverInfo,
  onOpenGlossary,
  theme = 'dark',
  onToggleTheme,
}) {
  const isConnected = wsStatus === 'connected';
  const hasModels = serverInfo?.models && serverInfo.models.length > 0;

  return (
    <header className="header">
      {/* ── Main Top Bar: Brand on Left, Quick Action Buttons on Right ── */}
      <div className="header__main-row">
        <div className="header__brand">
          <div className="header__logo-container" title="ইশারা · Ishara AI Sign Language System">
            <img
              src="/logo.png"
              alt="AI Sign Language Emblem LOGO"
              className="header__logo-img"
            />
          </div>
          <div className="header__title-group">
            <div className="header__title-row">
              <h1 className="header__title">ইশারা · Ishara</h1>
              <span className="header__title-tag">AI Vision</span>
            </div>
            <p className="header__subtitle">
              Bangla Sign Language Translation System · 100 Classes · Vision Transformer
            </p>
          </div>
        </div>

        {/* Quick Utility Action Buttons (Neatly aligned beside each other on right) */}
        <div className="header__quick-actions">
          {/* 100 Classes Dictionary Trigger */}
          <button
            type="button"
            className="btn btn--sm btn--secondary header__dict-btn"
            onClick={onOpenGlossary}
            title="Browse all 100 sign language classes dictionary"
          >
            <IconBookOpen size={15} />
            <span className="header__dict-label">Dictionary</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>
        </div>
      </div>

      {/* ── Balanced System Status Strip (Desktop Inline / Mobile Equal 2-Column Grid) ── */}
      <div className="header__status-strip">
        {/* MediaPipe Client AI Status */}
        <div
          className={`status-badge ${
            mpReady
              ? 'status-badge--connected'
              : mpLoading
              ? 'status-badge--buffering'
              : 'status-badge--disconnected'
          }`}
          title="MediaPipe Tasks Vision Client-side Engine"
        >
          <span className="status-dot" />
          <IconActivity size={13} />
          <span className="status-badge__text">
            {mpReady ? 'Vision AI Ready' : mpLoading ? 'Initializing AI...' : 'Vision Error'}
          </span>
        </div>

        {/* Backend Server / Model Status */}
        <div
          className={`status-badge ${
            isConnected && hasModels
              ? 'status-badge--connected'
              : isConnected && !hasModels
              ? 'status-badge--buffering'
              : wsStatus === 'connecting'
              ? 'status-badge--buffering'
              : 'status-badge--disconnected'
          }`}
          title={hasModels ? `Active Model Weights: ${serverInfo.models.join(', ')}` : 'Backend Online'}
        >
          <span className="status-dot" />
          <IconCpu size={13} />
          <span className="status-badge__text">
            {isConnected
              ? hasModels
                ? `Models Ready (${serverInfo.models.length})`
                : 'Server Online'
              : wsStatus === 'connecting'
              ? 'Connecting Server...'
              : 'Server Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
