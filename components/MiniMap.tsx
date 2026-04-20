"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define a custom icon (use Next's public folder if needed, but here we use a simple divIcon)
const centerMarkerIcon = L.divIcon({
  className: "bg-transparent",
  html: `
    <div style="
      width: 48px;
      height: 48px;
      background: white;
      border: 4px solid #0A66C2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(10, 102, 194, 0.4);
      transform: translate(-5px, -5px);
    ">
      <span class="material-symbols-outlined" style="color: #0A66C2; font-size: 24px; font-variation-settings: 'FILL' 1;">location_on</span>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

export default function MiniMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Fast refresh cleanup
    if ((containerRef.current as any)._leaflet_id) {
       (containerRef.current as any)._leaflet_id = null;
       containerRef.current.innerHTML = '';
    }

    if (mapRef.current) return;

    // Use a fixed location or generic Istanbul location for the preview
    const center: [number, number] = [41.015, 28.979];

    const map = L.map(containerRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.marker(center, { icon: centerMarkerIcon }).addTo(map);

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

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height: "100%" }} 
      className="pointer-events-none" // Disable all interaction at CSS level too
    />
  );
}
