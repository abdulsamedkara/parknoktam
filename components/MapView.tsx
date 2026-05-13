"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Spot {
  id: string;
  title: string;
  lat: number;
  lng: number;
  pricePerHour: number;
  rating: number;
  occupancyRate: number;
}

// Fix leaflet's default icon paths broken by webpack
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom price marker HTML — clean pill with occupancy dot
function createPriceMarker(price: number, isActive: boolean, occupancyRate: number) {
  const bg = isActive
    ? "linear-gradient(135deg,#0A66C2,#1e88e5)"
    : "#ffffff";
  const color  = isActive ? "#ffffff" : "#0A66C2";
  const shadow = isActive
    ? "0 4px 16px rgba(10,102,194,0.50)"
    : "0 2px 10px rgba(0,0,0,0.14)";
  const border = isActive ? "none" : "2px solid #0A66C2";
  const scale  = isActive ? "scale(1.12)" : "scale(1)";

  let occColor = "#10b981";
  if (occupancyRate >= 0.8) occColor = "#ef4444";
  else if (occupancyRate >= 0.5) occColor = "#f59e0b";

  return L.divIcon({
    className: "leaflet-price-marker",
    html: `
      <div style="
        background: ${bg};
        color: ${color};
        border: ${border};
        border-radius: 32px;
        padding: 5px 10px;
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        font-weight: 800;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: ${shadow};
        transform: ${scale};
        transform-origin: center bottom;
        transition: all 0.2s ease;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        line-height: 1;
        min-width: 36px;
        justify-content: center;
      ">
        <span style="display:block; width:6px; height:6px; border-radius:50%; background:${occColor}"></span>
        &#8378;${price}
      </div>
    `,
    iconAnchor: [24, 16],
    iconSize: undefined as unknown as [number,number],
  });
}

// Blue pulsing GPS marker for user location
function createUserLocationMarker() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative; width:24px; height:24px;">
        <div style="
          position:absolute; inset:0;
          background:rgba(59,130,246,0.25);
          border-radius:50%;
          animation: pulse 1.8s ease-out infinite;
        "></div>
        <div style="
          position:absolute; top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:14px; height:14px;
          background:#2563eb;
          border-radius:50%;
          border:2.5px solid white;
          box-shadow:0 2px 8px rgba(37,99,235,0.6);
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0%   { transform:scale(1);   opacity:0.8; }
          70%  { transform:scale(2.2); opacity:0; }
          100% { transform:scale(2.2); opacity:0; }
        }
      </style>
    `,
    iconAnchor: [12, 12],
    iconSize: [24, 24],
  });
}

// Green destination marker for search center
function createDestinationMarker(label?: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        ${ label ? `<div style="background:#15803d;color:white;font-size:10px;font-weight:800;padding:3px 8px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 8px rgba(21,128,61,0.45);margin-bottom:3px;">${label}</div>` : "" }
        <div style="
          width:36px; height:36px;
          background: linear-gradient(135deg,#16a34a,#15803d);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 4px 16px rgba(21,128,61,0.5);
        "></div>
      </div>
    `,
    iconAnchor: [18, 36],
    iconSize: [36, 42],
  });
}

// Crosshair marker for map-click center (no label)
function createCenterMarker() {
  return L.divIcon({
    className: "leaflet-center-marker",
    html: `
      <div style="
        width: 32px; height: 32px;
        background: white;
        border-radius: 50%;
        border: 3px solid #0A66C2;
        box-shadow: 0 4px 16px rgba(10,102,194,0.4);
        display: flex; align-items: center; justify-content: center;
        transform: translate(-50%, -50%);
      ">
        <div style="width:8px;height:8px;background:#0A66C2;border-radius:50%;"></div>
      </div>
    `,
    iconAnchor: [0, 0],
    iconSize: [1, 1],
  });
}

interface MapViewProps {
  spots: Spot[];
  activeSpotId: string | null;
  onMarkerClick: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  searchCenter?: {lat: number, lng: number} | null;
  searchRadius?: number | null;
  flyTo?: {lat: number, lng: number, zoom?: number} | null;
  userLocation?: {lat: number, lng: number} | null;
  geocodeLabel?: string | null;
}

export default function MapView({ spots, activeSpotId, onMarkerClick, onMapClick, searchCenter, searchRadius, flyTo, userLocation, geocodeLabel }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // onMapClick için ref — map click handler tek seferlik register edilir
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;
    
    if ((containerRef.current as any)._leaflet_id) {
       (containerRef.current as any)._leaflet_id = null;
       containerRef.current.innerHTML = '';
    }

    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [41.0201, 40.5234],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.stop();
          mapRef.current.off();
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {}
    };
  }, []);

  // Wire up map click handler — ref kullandığı için dependency yok, bir kez register edilir
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handleClick);
    return () => { map.off("click", handleClick); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FlyTo when geocoding result comes
  useEffect(() => {
    if (!mapRef.current || !flyTo) return;
    mapRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { animate: true, duration: 1.2 });
  }, [flyTo]);

  // Update markers when spots change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Her zaman önce mevcut markerları temizle (filtrelenince eski markerlar kalmasın)
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    if (spots.length === 0) return;

    spots.forEach(spot => {
      const isActive = spot.id === activeSpotId;
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createPriceMarker(spot.pricePerHour, isActive, spot.occupancyRate || 0),
      });

      marker.on("click", () => onMarkerClick(spot.id));

      marker.bindTooltip(
        `<strong>${spot.title}</strong><br/>₺${spot.pricePerHour}/saat • ⭐${spot.rating.toFixed(1)}`,
        { direction: "top", offset: [0, -10] }
      );

      marker.addTo(map);
      markersRef.current.set(spot.id, marker);
    });

    // Only auto-fit if no search center is active
    if (!searchCenter) {
      const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], animate: false });
    }
  }, [spots, activeSpotId, onMarkerClick]);

  // Pan to active spot
  useEffect(() => {
    if (!mapRef.current || !activeSpotId) return;
    const spot = spots.find(s => s.id === activeSpotId);
    if (spot) {
      mapRef.current.panTo([spot.lat, spot.lng], { animate: true });
    }
  }, [activeSpotId, spots]);

  // Draw search radius circle + destination pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }
    if (centerMarkerRef.current) { centerMarkerRef.current.remove(); centerMarkerRef.current = null; }

    if (searchCenter && searchRadius) {
      circleRef.current = L.circle([searchCenter.lat, searchCenter.lng], {
        color: '#16a34a',
        fillColor: '#16a34a',
        fillOpacity: 0.07,
        radius: searchRadius,
        weight: 2,
        dashArray: "6 4",
      }).addTo(map);

      centerMarkerRef.current = L.marker([searchCenter.lat, searchCenter.lng], {
        icon: createDestinationMarker(geocodeLabel ?? undefined),
        zIndexOffset: 1000,
      }).addTo(map);

      map.fitBounds(circleRef.current.getBounds(), { padding: [40, 40], animate: true });
    } else if (searchCenter) {
      centerMarkerRef.current = L.marker([searchCenter.lat, searchCenter.lng], {
        icon: createCenterMarker(),
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [searchCenter, searchRadius, geocodeLabel]);

  // Draw user location marker (blue pulsing dot)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
    if (userLocation) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserLocationMarker(),
        zIndexOffset: 2000,
      }).addTo(map);
    }
  }, [userLocation]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
