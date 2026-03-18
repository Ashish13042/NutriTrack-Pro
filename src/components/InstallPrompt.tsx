"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pwa-banner {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 9999;
          padding: 0 12px 12px;
          pointer-events: none;
        }
        .pwa-card {
          max-width: 500px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          border: 1.5px solid rgba(99,102,241,0.4);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 10px 40px rgba(99,102,241,0.4), 0 2px 10px rgba(0,0,0,0.3);
          animation: slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          pointer-events: all;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pwa-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pwa-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        .pwa-text-box {
          flex: 1;
          min-width: 0;
        }
        .pwa-title {
          font-size: 14px; font-weight: 700; color: #fff;
          font-family: 'Inter', sans-serif;
          line-height: 1.2; margin-bottom: 3px;
        }
        .pwa-subtitle {
          font-size: 11px;
          color: rgba(199,210,254,0.85);
          font-family: 'Inter', sans-serif;
          line-height: 1.3;
        }
        .pwa-actions {
          display: flex;
          gap: 10px;
        }
        .pwa-btn {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .pwa-btn-notnow {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.9);
        }
        .pwa-btn-notnow:hover { background: rgba(255,255,255,0.15); }
        .pwa-btn-install {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(99,102,241,0.5);
        }
        .pwa-btn-install:hover {
          box-shadow: 0 6px 22px rgba(99,102,241,0.7);
          transform: translateY(-1px);
        }
        
        /* For very small screens, make things more compact */
        @media (max-width: 360px) {
          .pwa-card { padding: 12px; gap: 12px; }
          .pwa-icon { width: 40px; height: 40px; font-size: 20px; }
          .pwa-title { font-size: 13px; }
          .pwa-subtitle { font-size: 10px; }
        }
      `}</style>

      <div className="pwa-banner">
        <div className="pwa-card">
          <div className="pwa-info">
            <div className="pwa-icon">🥦</div>
            <div className="pwa-text-box">
              <p className="pwa-title">NutriTrack Pro</p>
              <p className="pwa-subtitle">Get the app for a faster desktop & mobile experience.</p>
            </div>
          </div>
          <div className="pwa-actions">
            <button className="pwa-btn pwa-btn-notnow" onClick={handleDismiss}>
              Not now
            </button>
            <button className="pwa-btn pwa-btn-install" onClick={handleInstall}>
              Install App
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
