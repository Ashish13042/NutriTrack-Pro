"use client";

import { useEffect, useState, MouseEvent } from "react";

export default function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed in this session
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!show || dismissed || installed) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: "0 12px 12px",
      pointerEvents: "none",
    }}>
      <div style={{
        maxWidth: 540,
        margin: "0 auto",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        border: "1.5px solid rgba(99,102,241,0.4)",
        borderRadius: 18,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 8px 32px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.25)",
        pointerEvents: "all",
        animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        {/* App Icon */}
        <div style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
        }}>
          🥦
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 2,
            fontFamily: "'Inter', sans-serif",
          }}>
            Add NutriTrack Pro to Home Screen
          </p>
          <p style={{
            fontSize: 11,
            color: "rgba(199,210,254,0.8)",
            fontFamily: "'Inter', sans-serif",
          }}>
            Track macros fast — works offline too
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleDismiss}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(199,210,254,0.9)",
              padding: "7px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              color: "#fff",
              padding: "7px 16px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 14px rgba(99,102,241,0.5)",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.7)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.5)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Install App
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
