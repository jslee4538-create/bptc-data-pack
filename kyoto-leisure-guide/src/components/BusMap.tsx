"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { BusRoute, BusStop } from "@/types/database";

type Props = {
  stops: BusStop[];
  routes: BusRoute[];
  selectedRouteId?: string;
};

const KYOTO_CENTER: [number, number] = [35.0036, 135.7681];

export default function BusMap({ stops, routes, selectedRouteId }: Props) {
  const visibleStops = useMemo(
    () =>
      selectedRouteId
        ? stops.filter((s) => s.route_ids.includes(selectedRouteId))
        : stops,
    [stops, selectedRouteId]
  );

  const routeMap = useMemo(() => {
    const map = new Map<string, BusRoute>();
    routes.forEach((r) => map.set(r.id, r));
    return map;
  }, [routes]);

  const selectedRoute = selectedRouteId ? routeMap.get(selectedRouteId) : undefined;
  const markerColor = selectedRoute?.color ?? "#f43f5e";

  return (
    <div className="h-72 rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-zinc-700">
      <MapContainer
        center={KYOTO_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <FitToStops stops={visibleStops} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visibleStops.map((stop) => (
          <CircleMarker
            key={stop.id}
            center={[stop.lat, stop.lng]}
            radius={7}
            pathOptions={{
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{stop.name}</p>
                <p className="mt-1 text-zinc-500">경유 노선</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {stop.route_ids.map((rid) => {
                    const r = routeMap.get(rid);
                    return (
                      <span
                        key={rid}
                        className="px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold"
                        style={{ backgroundColor: r?.color ?? "#888" }}
                      >
                        {r?.route_number ?? rid}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function FitToStops({ stops }: { stops: BusStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length === 0) {
      map.setView(KYOTO_CENTER, 13);
      return;
    }
    const lats = stops.map((s) => s.lat);
    const lngs = stops.map((s) => s.lng);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, stops]);
  return null;
}
