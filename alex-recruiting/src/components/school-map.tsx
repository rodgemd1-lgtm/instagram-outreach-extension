"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { targetSchools } from "@/lib/data/target-schools";
import { getSchoolColors } from "@/lib/data/school-branding";

import "leaflet/dist/leaflet.css";

// School coordinates (approximate campus locations)
const SCHOOL_COORDS: Record<string, [number, number]> = {
  wisconsin: [43.0766, -89.4125],
  northwestern: [42.0565, -87.6753],
  iowa: [41.6611, -91.5302],
  "iowa-state": [42.0267, -93.6465],
  "northern-illinois": [41.9339, -88.7734],
  "western-michigan": [42.2833, -85.6114],
  "ball-state": [40.2065, -85.4087],
  "central-michigan": [43.5897, -84.7749],
  "south-dakota-state": [44.3114, -96.7984],
  "north-dakota-state": [46.8958, -96.8005],
  "illinois-state": [40.5114, -88.9913],
  "youngstown-state": [41.1043, -80.6495],
  "saginaw-valley": [43.5071, -83.9554],
  "michigan-tech": [47.1164, -88.5485],
  "ferris-state": [43.6867, -85.4837],
  "winona-state": [44.0490, -91.6666],
  "minnesota-state-mankato": [44.1589, -93.9993],
};

const TIER_COLORS: Record<string, string> = {
  "Tier 1": "#DC2626", // red
  "Tier 2": "#F59E0B", // amber
  "Tier 3": "#16A34A", // green
};

function createTierIcon(tier: string, schoolColor: string): L.DivIcon {
  const borderColor = TIER_COLORS[tier] || "#6B7280";
  return L.divIcon({
    className: "custom-school-marker",
    html: `<div style="
      width: 28px; height: 28px;
      border-radius: 50%;
      background: ${schoolColor};
      border: 3px solid ${borderColor};
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// Pewaukee, WI location
const PEWAUKEE: [number, number] = [43.0805, -88.2596];

export function SchoolMap() {
  // Fix leaflet default icon issue in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full border-2"
              style={{ borderColor: color, backgroundColor: "white" }}
            />
            <span className="text-xs text-[var(--app-muted)]">{tier}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-xs text-[var(--app-muted)]">Pewaukee (Home)</span>
        </div>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-[rgba(15,40,75,0.12)]">
        <MapContainer
          center={[43.0, -88.5]}
          zoom={6}
          style={{ height: "600px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Pewaukee home marker */}
          <Marker position={PEWAUKEE}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Pewaukee, WI</p>
                <p className="text-xs text-gray-500">Home — Jacob Rodgers</p>
              </div>
            </Popup>
          </Marker>

          {/* School markers */}
          {targetSchools.map((school) => {
            const coords = SCHOOL_COORDS[school.id];
            if (!coords) return null;

            const colors = getSchoolColors(school.id);
            const icon = createTierIcon(school.priorityTier, colors.primary);

            return (
              <Marker key={school.id} position={coords} icon={icon}>
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/logos/${school.id}.svg`}
                        alt={school.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-sm">{school.name}</p>
                        <p className="text-xs text-gray-500">
                          {school.division} &middot; {school.conference}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs">
                        <span className="font-medium">Tier:</span> {school.priorityTier}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">DM Timeline:</span> {school.dmTimeline}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">X:</span> {school.officialXHandle}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{school.whyJacob}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
