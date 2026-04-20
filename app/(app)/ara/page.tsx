"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Spot {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  pricePerHour: number;
  category: string;
  spotType: string;
  rating: number;
  reviewCount: number;
  hasCCTV: boolean;
  hasEVCharger: boolean;
  isHandicapped: boolean;
  occupancyRate: number;
  photos: string;
}

type FilterKey = "ev" | "engelli" | "kamera";

export default function AraPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [activeSpot, setActiveSpot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());

  useEffect(() => {
    fetch("/api/spots")
      .then(res => res.json())
      .then(data => setSpots(data));
  }, []);

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredSpots = useMemo(() => {
    return spots.filter(s => {
      if (activeFilters.has("ev") && !s.hasEVCharger) return false;
      if (activeFilters.has("engelli") && !s.isHandicapped) return false;
      if (activeFilters.has("kamera") && !s.hasCCTV) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.title.toLowerCase().includes(q) && !s.address.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [spots, activeFilters, searchQuery]);

  const selectedSpotData = activeSpot ? filteredSpots.find(s => s.id === activeSpot) : null;

  let photoUrl = "";
  if (selectedSpotData?.photos) {
    try { photoUrl = JSON.parse(selectedSpotData.photos)[0] ?? ""; } catch {}
  }

  const filters: { key: FilterKey; icon: string; label: string }[] = [
    { key: "ev",      icon: "ev_station",  label: "EV" },
    { key: "engelli", icon: "accessible",  label: "Engelli" },
    { key: "kamera",  icon: "videocam",    label: "Kamera" },
  ];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "calc(100dvh - 72px)" }}>

      {/* ── MAP ── */}
      <div className="absolute inset-0">
        <MapView
          spots={filteredSpots}
          onMarkerClick={id => { setActiveSpot(id); setShowSearch(false); }}
          activeSpotId={activeSpot}
        />
      </div>

      {/* ── TOP SEARCH BAR ── */}
      <div className="absolute top-4 left-4 right-4 z-[400]">
        {showSearch ? (
          /* Expanded search input */
          <div style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            borderRadius: "18px",
            border: "1px solid rgba(10,102,194,0.25)",
            boxShadow: "0 8px 32px rgba(10,102,194,0.15), inset 0 1px 0 rgba(255,255,255,1)",
            padding: "4px 8px 4px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "20px" }}>search</span>
            <input
              autoFocus
              type="text"
              placeholder="Otopark adı veya semt ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 outline-none py-3"
            />
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(""); }}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-slate-500" style={{ fontSize: "18px" }}>close</span>
            </button>
          </div>
        ) : (
          /* Collapsed search pill → tap to expand */
          <button
            onClick={() => setShowSearch(true)}
            className="w-full active:scale-[0.98] transition-transform text-left"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(16px)",
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,1)",
              padding: "11px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#0A66C2,#1e88e5)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: "17px" }}>local_parking</span>
            </div>
            <span className="font-semibold text-slate-500 text-sm flex-1">
              {searchQuery || "Yakınındaki park yerlerini bul"}
            </span>
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>search</span>
          </button>
        )}
      </div>

      {/* ── FILTER PILLS ── */}
      <div className="absolute top-[74px] left-4 flex flex-col gap-2 z-[400]">
        {filters.map(f => {
          const on = activeFilters.has(f.key);
          return (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className="active:scale-90 transition-transform"
              style={{
                background: on
                  ? "linear-gradient(135deg,#0A66C2,#1e88e5)"
                  : "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                border: on ? "none" : "1px solid rgba(255,255,255,0.85)",
                boxShadow: on
                  ? "0 4px 16px rgba(10,102,194,0.35)"
                  : "0 4px 14px rgba(0,0,0,0.09)",
                borderRadius: "14px",
                padding: "7px 11px",
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center",
                gap: "2px",
                minWidth: "48px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px", color: on ? "#fff" : "#0A66C2" }}
              >{f.icon}</span>
              <span style={{
                fontSize: "9px",
                fontWeight: 700,
                color: on ? "rgba(255,255,255,0.85)" : "#64748b",
              }}>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active filter count badge */}
      {activeFilters.size > 0 && (
        <div className="absolute top-[74px] right-4 z-[400]">
          <span style={{
            background: "#0A66C2",
            color: "white",
            borderRadius: "10px",
            padding: "4px 8px",
            fontSize: "11px",
            fontWeight: 800,
          }}>
            {filteredSpots.length} sonuç
          </span>
        </div>
      )}

      {/* ── RIGHT TOOLS ── */}
      <div className="absolute right-4 flex flex-col gap-2 z-[400]" style={{ top: activeFilters.size > 0 ? "110px" : "74px" }}>
        {[{ icon: "my_location" }, { icon: "refresh" }].map(t => (
          <button key={t.icon} style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.09)",
            borderRadius: "14px",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }} className="active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-slate-600" style={{ fontSize: "22px" }}>{t.icon}</span>
          </button>
        ))}
      </div>

      {/* ── BOTTOM SHEET ── */}
      <div
        className="absolute left-0 right-0 z-[500] transition-all duration-300 ease-out"
        style={{ bottom: selectedSpotData ? "0px" : "-240px", padding: "0 14px 14px" }}
      >
        {selectedSpotData && (
          <>
            {/* Handle bar */}
            <div className="flex justify-center mb-2">
              <button
                onClick={() => setActiveSpot(null)}
                className="w-10 h-1.5 rounded-full bg-white/60 active:bg-white/90 transition-colors"
              />
            </div>

            <div style={{
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(28px)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}>
              {/* Thumbnail */}
              <div style={{
                width: 76,
                height: 76,
                borderRadius: "18px",
                overflow: "hidden",
                background: "#e2e8f0",
                flexShrink: 0,
              }}>
                {photoUrl
                  ? <img src={photoUrl} className="w-full h-full object-cover" alt={selectedSpotData.title} />
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-300" style={{ fontSize: "38px", fontVariationSettings:"'FILL' 1" }}>local_parking</span>
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-slate-800 text-[15px] truncate leading-tight mb-0.5">
                  {selectedSpotData.title}
                </h3>
                <p className="text-slate-400 text-xs truncate mb-2">{selectedSpotData.address}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{
                    background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
                    color: "white",
                    borderRadius: "8px",
                    padding: "3px 9px",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}>₺{selectedSpotData.pricePerHour}/sa</span>
                  <span style={{
                    background: "#fef3c7",
                    borderRadius: "8px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#b45309",
                  }}>★ {selectedSpotData.rating.toFixed(1)}</span>
                  {selectedSpotData.hasCCTV && (
                    <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: "16px" }}>videocam</span>
                  )}
                  {selectedSpotData.hasEVCharger && (
                    <span className="material-symbols-outlined text-violet-500" style={{ fontSize: "16px" }}>ev_station</span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/otopark/${selectedSpotData.id}`}
                className="shrink-0 active:scale-90 transition-transform"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
                  boxShadow: "0 6px 20px rgba(10,102,194,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: "26px" }}>chevron_right</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
