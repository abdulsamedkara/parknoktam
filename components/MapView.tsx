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

const activeMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -40],
  shadowSize: [52, 52],
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

  // Doluluğa göre renk: %80 üstü kırmızı, %50-80 sarı, altı yeşil
  let occColor = "#10b981"; // green
  if (occupancyRate >= 0.8) occColor = "#ef4444"; // red
  else if (occupancyRate >= 0.5) occColor = "#f59e0b"; // yellow

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

interface MapViewProps {
  spots: Spot[];
  activeSpotId: string | null;
  onMarkerClick: (id: string) => void;
}

export default function MapView({ spots, activeSpotId, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Fast refresh cleanup
    if ((containerRef.current as any)._leaflet_id) {
       (containerRef.current as any)._leaflet_id = null;
       containerRef.current.innerHTML = '';
    }

    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [41.0201, 40.5234], // Rize Merkez
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom zoom control position
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
      } catch (e) {
        // Ignore leaflet cleanup errors due to DOM destruction
      }
    };
  }, []);

  // Update markers when spots change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || spots.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

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

    // Fit bounds to all spots
    const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [50, 50], animate: false });
  }, [spots, activeSpotId, onMarkerClick]);

  // Pan to active spot
  useEffect(() => {
    if (!mapRef.current || !activeSpotId) return;
    const spot = spots.find(s => s.id === activeSpotId);
    if (spot) {
      mapRef.current.panTo([spot.lat, spot.lng], { animate: false });
    }
  }, [activeSpotId, spots]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
