"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  hasGuard: boolean;
  occupancyRate: number;
  photos: string;
}

// Distance helper
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type FilterKey = "ev" | "engelli" | "kamera" | "guvenlik";
interface NominatimResult { place_id: number; lat: string; lon: string; display_name: string; }

export default function AraPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [activeSpot, setActiveSpot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeLabel, setGeocodeLabel] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [radiusInput, setRadiusInput] = useState("1");

  // Radius Search & Distance
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(1000);
  const [searchCenter, setSearchCenter] = useState<{lat: number, lng: number} | null>(null);
  const [flyTo, setFlyTo] = useState<{lat: number, lng: number, zoom?: number} | null>(null);

  useEffect(() => {
    // Demo için canlı konum kapatıldı, sabit konum atandı.
    setUserLocation({ lat: 41.035424, lng: 40.561674 });
  }, []);

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

  // Türkçe kısaltmaları genişlet
  const expandQuery = (q: string): string => {
    const lower = q.toLowerCase().trim();
    const abbrs: Record<string, string> = {
      "avm":    "alışveriş merkezi",
      "avmler": "alışveriş merkezi",
      "hst":    "hastane",
      "ünv":    "üniversite",
      "bld":    "belediye",
      "ptt":    "posta",
    };
    if (abbrs[lower]) return abbrs[lower];
    // "avm xyz" gibi prefix kontrolü
    for (const [abbr, full] of Object.entries(abbrs)) {
      if (lower.startsWith(abbr + " ")) {
        return full + q.slice(abbr.length);
      }
    }
    return q;
  };

  // Debounced autocomplete
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;
    debounceRef.current = setTimeout(async () => {
      setLoadingSugg(true);
      try {
        const expanded = expandQuery(val.trim());
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(expanded + ", Rize, Turkey")}&format=json&limit=6&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "tr" } });
        const results = await res.json();
        // Sonuç yoksa orijinal sorgu ile tekrar dene
        if (results.length === 0 && expanded !== val.trim()) {
          const url2 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val.trim() + ", Rize, Turkey")}&format=json&limit=6&addressdetails=1`;
          const res2 = await fetch(url2, { headers: { "Accept-Language": "tr" } });
          setSuggestions(await res2.json());
        } else {
          setSuggestions(results);
        }
      } catch {}
      setLoadingSugg(false);
    }, 400);
  };

  const handleSelectSuggestion = (item: NominatimResult) => {
    const newCenter = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    const label = item.display_name.split(",")[0];
    setSearchCenter(newCenter);
    setFlyTo({ ...newCenter, zoom: 15 });
    setGeocodeLabel(label);
    setSearchQuery(""); // Lokasyon adını text filtreye koyma, yoksa spotlar filtrelenir
    setSuggestions([]);
    setShowSearch(false);
  };

  const handleGeocode = async () => {
    if (suggestions.length > 0) { handleSelectSuggestion(suggestions[0]); return; }
    const q = searchQuery.trim();
    if (!q) return;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", Rize, Turkey")}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "tr" } });
      const data = await res.json();
      if (data?.length > 0) handleSelectSuggestion(data[0]);
    } catch {}
    setGeocoding(false);
  };

  // useCallback: render başına yeni referans oluşmasın → MapView effect tetiklenmesin
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSearchCenter({ lat, lng });
    setGeocodeLabel(null);
    setSuggestions([]);
    setActiveSpot(null);
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    setActiveSpot(id);
    setShowSearch(false);
  }, []);

  // searchCenter yoksa userLocation'ı fallback olarak kullan
  const effectiveCenter = searchCenter || userLocation;

  const filteredSpots = useMemo(() => {
    return spots.filter(s => {
      if (activeFilters.has("ev") && !s.hasEVCharger) return false;
      if (activeFilters.has("engelli") && !s.isHandicapped) return false;
      if (activeFilters.has("kamera") && !s.hasCCTV) return false;
      if (activeFilters.has("guvenlik") && !s.hasGuard) return false;
      if (minRating > 0 && s.rating < minRating) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.title.toLowerCase().includes(q) && !s.address.toLowerCase().includes(q)) return false;
      }
      if (searchRadius > 0 && effectiveCenter) {
        const dist = haversine(effectiveCenter.lat, effectiveCenter.lng, s.lat, s.lng);
        if (dist > searchRadius) return false;
      }
      return true;
    });
  }, [spots, activeFilters, minRating, searchQuery, searchRadius, effectiveCenter]);

  // Mesafe yardımcısı
  function distRow(meters: number) {
    return {
      dist: meters > 1000 ? (meters / 1000).toFixed(1) + " km" : Math.round(meters) + " m",
      walk: Math.max(1, Math.round(meters / 83)),
      drive: Math.max(1, Math.round(meters / 500)),
    };
  }

  const selectedSpotData = activeSpot ? filteredSpots.find(s => s.id === activeSpot) : null;

  // Üç mesafe satırı: konumdan parka, hedeften parka, konumdan hedefe
  const distUser   = selectedSpotData && userLocation
    ? distRow(haversine(userLocation.lat, userLocation.lng, selectedSpotData.lat, selectedSpotData.lng))
    : null;
  const distDest   = selectedSpotData && searchCenter
    ? distRow(haversine(searchCenter.lat, searchCenter.lng, selectedSpotData.lat, selectedSpotData.lng))
    : null;
  const distToGoal = userLocation && searchCenter
    ? distRow(haversine(userLocation.lat, userLocation.lng, searchCenter.lat, searchCenter.lng))
    : null;

  let photoUrl = "";
  if (selectedSpotData?.photos) {
    try { photoUrl = JSON.parse(selectedSpotData.photos)[0] ?? ""; } catch {}
  }

  const filters: { key: FilterKey; icon: string; label: string }[] = [
    { key: "ev",      icon: "ev_station",  label: "EV" },
    { key: "engelli", icon: "accessible",  label: "Engelli" },
    { key: "kamera",  icon: "videocam",    label: "Kamera" },
    { key: "guvenlik",icon: "shield_person",label: "Güvenlik" },
  ];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "calc(100dvh - 72px)" }}>

      {/* ── MAP ── */}
      <div className="absolute inset-0">
        <MapView
          spots={filteredSpots}
          onMarkerClick={handleMarkerClick}
          activeSpotId={activeSpot}
          onMapClick={handleMapClick}
          searchCenter={effectiveCenter ?? null}
          searchRadius={searchRadius > 0 ? searchRadius : null}
          flyTo={flyTo}
          userLocation={userLocation}
          geocodeLabel={geocodeLabel}
        />
      </div>

      {/* ── TOP BAR: Arama + Filtre Butonu ── */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex gap-2">
        {/* Search pill / expanded */}
        <div className="flex-1">
        {showSearch ? (
          <>
            <div style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              borderRadius: "18px",
              border: "1px solid rgba(10,102,194,0.25)",
              boxShadow: "0 8px 32px rgba(10,102,194,0.15)",
              padding: "4px 8px 4px 14px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "20px" }}>search</span>
              <input
                autoFocus
                type="text"
                placeholder="Şimal AVM, Hastane, Cadde..."
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGeocode()}
                className="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 outline-none py-3"
              />
              {(geocoding || loadingSugg) ? (
                <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "20px", animation: "spin 1s linear infinite" }}>refresh</span>
              ) : (
                <button onClick={handleGeocode} className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90" style={{ background: "linear-gradient(135deg,#0A66C2,#1e88e5)" }}>
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "18px" }}>arrow_forward</span>
                </button>
              )}
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90">
                <span className="material-symbols-outlined text-slate-500" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>
            {suggestions.length > 0 && (
              <div style={{ marginTop: "6px", background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)", borderRadius: "16px", border: "1px solid rgba(10,102,194,0.12)", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", overflow: "hidden" }}>
                {suggestions.map((item, i) => (
                  <button key={item.place_id} onClick={() => handleSelectSuggestion(item)} className="w-full text-left active:bg-blue-50" style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: "10px", borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: "18px", color: "#0A66C2" }}>location_on</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-slate-800 truncate">{item.display_name.split(",")[0]}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.display_name.split(",").slice(1,3).join(",")}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <button onClick={() => setShowSearch(true)} className="w-full active:scale-[0.98] text-left" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", padding: "11px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#0A66C2,#1e88e5)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: "17px" }}>local_parking</span>
            </div>
            <span className="font-semibold text-slate-500 text-sm flex-1 truncate">
              {geocodeLabel ? `📍 ${geocodeLabel}` : "Nereye gidiyorsunuz?"}
            </span>
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>search</span>
          </button>
        )}
        </div>

        {/* Filtre Butonu */}
        {!showSearch && (
          <button
            onClick={() => setShowFilterSheet(true)}
            className="shrink-0 active:scale-90 transition-transform relative"
            style={{
              background: (activeFilters.size > 0 || minRating > 0) ? "linear-gradient(135deg,#0A66C2,#1e88e5)" : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(16px)",
              borderRadius: "18px",
              width: "52px", height: "52px",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px", color: (activeFilters.size > 0 || minRating > 0) ? "white" : "#0A66C2" }}>tune</span>
            {(activeFilters.size > 0 || minRating > 0) && (
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "#f59e0b", borderRadius: "50%", border: "1.5px solid white" }} />
            )}
          </button>
        )}
      </div>

      {/* ── KONUM GÖSTERGESİ: Mevcut konum + Seçili hedef (arama açıkken gizle) ── */}
      {!showSearch && (userLocation || searchCenter) && (
        <div className="absolute z-[400] flex items-center gap-2" style={{ top: "76px", left: "16px", right: "56px" }}>
          <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderRadius: "16px", padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: "10px", flex: 1, overflow: "hidden" }}>
            {/* Mevcut Konum */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.25)" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#1d4ed8" }}>{userLocation ? "Konumunuz" : "Konum Yok"}</span>
            </div>

            {/* Ok */}
            {searchCenter && (
              <>
                <span className="material-symbols-outlined text-slate-300" style={{ fontSize: "14px" }}>arrow_forward</span>
                {/* Seçili Hedef */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px", flex: 1, minWidth: 0 }}>
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: "12px", color: "#16a34a" }}>location_on</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#15803d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{geocodeLabel ?? "Seçili Nokta"}</span>
                </div>
                {/* Temizle */}
                <button onClick={() => { setSearchCenter(null); setGeocodeLabel(null); }} className="shrink-0 active:scale-90">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "16px" }}>close</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showFilterSheet && (
        <>
          {/* Backdrop */}
          <div className="absolute inset-0 z-[600] bg-black/30" onClick={() => setShowFilterSheet(false)} />
          {/* Sheet */}
          <div className="absolute left-0 right-0 bottom-0 z-[700]" style={{ padding: "0 0 0" }}>
            <div style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(28px)", borderRadius: "28px 28px 0 0", padding: "20px 20px 40px", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
              {/* Handle + Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "22px" }}>tune</span>
                  <h2 className="font-black text-slate-800 text-[17px]">Filtrele</h2>
                  {(activeFilters.size > 0 || minRating > 0) && (
                    <span style={{ background: "#0A66C2", color: "white", borderRadius: "10px", padding: "2px 8px", fontSize: "11px", fontWeight: 800 }}>
                      {filteredSpots.length} sonuç
                    </span>
                  )}
                </div>
                <button onClick={() => { setActiveFilters(new Set()); setMinRating(0); setSearchRadius(1000); setRadiusInput("1"); }} className="text-[12px] font-bold text-red-400 active:scale-95">Sıfırla</button>
              </div>

              {/* Özellikler */}
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Özellikler</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { key: "ev" as FilterKey, icon: "ev_station", label: "Elektrikli Araç Şarjı", color: "#7c3aed" },
                  { key: "engelli" as FilterKey, icon: "accessible", label: "Engelli Parkı", color: "#0A66C2" },
                  { key: "kamera" as FilterKey, icon: "videocam", label: "Güvenlik Kamerası", color: "#059669" },
                  { key: "guvenlik" as FilterKey, icon: "shield_person", label: "Güvenlik Görevlisi", color: "#dc2626" },
                ].map(f => {
                  const on = activeFilters.has(f.key);
                  return (
                    <button key={f.key} onClick={() => toggleFilter(f.key)} className="flex items-center gap-3 active:scale-95 transition-transform" style={{ background: on ? "rgba(10,102,194,0.08)" : "#f8fafc", borderRadius: "14px", padding: "12px", border: on ? "1.5px solid #0A66C2" : "1.5px solid #e2e8f0", textAlign: "left" }}>
                      <span className="material-symbols-outlined shrink-0" style={{ fontSize: "22px", color: on ? "#0A66C2" : f.color }}>{f.icon}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: on ? "#0A66C2" : "#334155", flex: 1 }}>{f.label}</span>
                      {on && <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "18px" }}>check_circle</span>}
                    </button>
                  );
                })}
              </div>

              {/* Min. Yıldız */}
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Minimum Puan</p>
              <div className="flex gap-2 mb-6">
                {[0,1,2,3,4].map(r => (
                  <button key={r} onClick={() => setMinRating(r)} className="flex-1 py-2 rounded-xl active:scale-95 transition-transform" style={{ background: minRating === r ? "#0A66C2" : "#f8fafc", border: minRating === r ? "1.5px solid #0A66C2" : "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: 800, color: minRating === r ? "white" : "#64748b" }}>
                    {r === 0 ? "Hepsi" : `${r}★+`}
                  </button>
                ))}
              </div>

              {/* Arama Yarıçapı */}
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Arama Yarıçapı</p>
              <div className="flex items-center gap-3 mb-6">
                <input
                  type="number"
                  min="0.1" max="50" step="0.1"
                  value={radiusInput}
                  onChange={e => setRadiusInput(e.target.value)}
                  onBlur={() => {
                    const v = parseFloat(radiusInput);
                    if (!isNaN(v) && v > 0) setSearchRadius(Math.round(v * 1000));
                  }}
                  className="flex-1 text-center font-black text-[20px] text-slate-800 outline-none bg-transparent"
                  style={{ border: "none", borderBottom: "2px solid #0A66C2", paddingBottom: "4px" }}
                />
                <span className="text-[15px] font-bold text-slate-500">km</span>
                <div className="flex gap-2">
                  {[0.5,1,2,5].map(v => (
                    <button key={v} onClick={() => { setRadiusInput(String(v)); setSearchRadius(v * 1000); }} className="px-3 py-1.5 rounded-xl active:scale-95" style={{ background: searchRadius === v*1000 ? "#0A66C2" : "#f8fafc", border: searchRadius === v*1000 ? "none" : "1.5px solid #e2e8f0", fontSize: "11px", fontWeight: 800, color: searchRadius === v*1000 ? "white" : "#64748b" }}>
                      {v}km
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowFilterSheet(false)} className="w-full py-4 rounded-2xl font-black text-white active:scale-[0.98] transition-transform" style={{ background: "linear-gradient(135deg,#0A66C2,#1e88e5)", boxShadow: "0 8px 24px rgba(10,102,194,0.35)", fontSize: "15px" }}>
                Uygula ({filteredSpots.length} sonuç)
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── BOTTOM SHEET ── */}
      <div
        className="absolute left-0 right-0 z-[500] transition-all duration-300 ease-out"
        style={{ bottom: selectedSpotData ? "0px" : "-320px", padding: "0 14px 14px" }}
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
            }}>
              {/* Row 1: Thumbnail + Info + CTA button */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: (distUser || distDest || distToGoal) ? "10px" : 0 }}>
                {/* Thumbnail */}
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: "16px",
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
                  <p className="text-slate-400 text-xs truncate mb-1.5">{selectedSpotData.address}</p>
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
                    {selectedSpotData.hasGuard && (
                      <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "16px" }}>shield_person</span>
                    )}
                    {selectedSpotData.hasEVCharger && (
                      <span className="material-symbols-outlined text-violet-500" style={{ fontSize: "16px" }}>ev_station</span>
                    )}
                  </div>
                </div>

                {/* CTA - sadece sağda, bilgileri kapatmaz */}
                <Link
                  href={`/otopark/${selectedSpotData.id}`}
                  className="shrink-0 active:scale-90 transition-transform"
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "14px",
                    background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
                    boxShadow: "0 6px 20px rgba(10,102,194,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "22px" }}>chevron_right</span>
                </Link>
              </div>

              {/* Row 2: Mesafe & Süre kartları */}
              {(distUser || distDest || distToGoal) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>

                  {/* Yardımcı bileşen: tek satır */}
                  {/* 1) Konumum → Park Yeri */}
                  {distUser && (
                    <div style={{ background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", overflow: "hidden" }}>
                      <div style={{ padding: "5px 10px 3px", fontSize: "9px", fontWeight: 700, color: "#1d4ed8", borderBottom: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>my_location</span>
                        Konumunuz → Park Yeri
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "6px 10px" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#1d4ed8" }}>{distUser.dist}</div>
                          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>Mesafe</div>
                        </div>
                        <div style={{ textAlign: "center", borderLeft: "1px solid #bfdbfe", borderRight: "1px solid #bfdbfe" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>🚶 {distUser.walk} dk</div>
                          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>Yürüyerek</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>🚗 {distUser.drive} dk</div>
                          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>Araçla</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2) Hedef → Park Yeri */}
                  {distDest && searchCenter && (
                    <div style={{ background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", overflow: "hidden" }}>
                      <div style={{ padding: "5px 10px 3px", fontSize: "9px", fontWeight: 700, color: "#15803d", borderBottom: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>location_on</span>
                        {geocodeLabel ?? "Park Yeri"} → Seçilen Konumlar (Hastane, Belediye Binası, AVM)
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "6px 10px" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#15803d" }}>1.2 km</div>
                          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>Mesafe</div>
                        </div>
                        <div style={{ textAlign: "center", borderLeft: "1px solid #bbf7d0", borderRight: "1px solid #bbf7d0" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>🚶 13 dk</div>
                          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>Yürüyerek</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>🚗 5 dk</div>
                          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>Araçla</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3) Park Yerine Yakın Popüler Yerler */}
                  {selectedSpotData && (() => {
                    const nearbyPlaces = [
                      { icon: "directions_bus", label: "Durak", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", dist: Math.round(Math.random() * 300 + 80) },
                      { icon: "local_mall", label: "AVM", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", dist: Math.round(Math.random() * 500 + 200) },
                      { icon: "local_hospital", label: "Hastane", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dist: Math.round(Math.random() * 800 + 300) },
                      { icon: "school", label: "Okul", color: "#d97706", bg: "#fffbeb", border: "#fde68a", dist: Math.round(Math.random() * 600 + 150) },
                    ];
                    return (
                      <div style={{ marginTop: "8px" }}>
                        {/* Başlık */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                          <div style={{ width: 3, height: 14, background: "linear-gradient(135deg,#0A66C2,#1e88e5)", borderRadius: "2px" }} />
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#334155", letterSpacing: "0.02em" }}>Park Yerine Yakın Popüler Yerler</span>
                        </div>
                        {/* Kartlar */}
                        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", paddingBottom: "2px" }}>
                          {nearbyPlaces.map(p => (
                            <div
                              key={p.label}
                              className="shrink-0 flex items-center gap-2.5"
                              style={{
                                background: p.bg,
                                border: `1px solid ${p.border}`,
                                borderRadius: "14px",
                                padding: "9px 13px",
                                minWidth: "fit-content",
                              }}
                            >
                              {/* İkon dairesi */}
                              <div style={{
                                width: 34, height: 34,
                                background: "white",
                                borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: `0 2px 8px ${p.border}`,
                                flexShrink: 0,
                              }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "17px", color: p.color, fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                              </div>
                              {/* Bilgi */}
                              <div>
                                <div style={{ fontSize: "12px", fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>{p.label}</div>
                                <div style={{ fontSize: "11px", fontWeight: 600, color: p.color, marginTop: "1px" }}>
                                  {p.dist < 1000 ? `${p.dist} m` : `${(p.dist / 1000).toFixed(1)} km`}
                                  <span style={{ color: "#94a3b8", fontWeight: 500 }}> · ~{Math.max(1, Math.round(p.dist / 83))} dk yürüyüş</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
