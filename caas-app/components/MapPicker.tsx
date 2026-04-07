"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Search, Loader2, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface LatLng {
  lat: number;
  lng: number;
  name?: string;
}

interface MapPickerProps {
  value?: LatLng;
  onChange?: (coords: LatLng) => void;
  onLocationName?: (name: string) => void;
  defaultCenter?: LatLng;
  defaultZoom?: number;
  label?: string;
  required?: boolean;
  height?: number;
  readOnly?: boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const LEAFLET_ICONS = {
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
};

const TILE_URLS = {
  road: "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
  satellite: "https://{s}.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
  hybrid: "https://{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}",
  terrain: "https://{s}.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
} as const;

const TILE_SUBDOMAINS = ["mt0", "mt1", "mt2", "mt3"];

type TileType = keyof typeof TILE_URLS;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function setupLeafletIcons(L: any) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions(LEAFLET_ICONS);
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json();
    const addr = data.address ?? {};

    const primary =
      addr.amenity ||
      addr.building ||
      addr.tourism ||
      addr.shop ||
      addr.office ||
      addr.leisure ||
      addr.road ||
      addr.neighbourhood ||
      addr.suburb ||
      data.display_name?.split(",")[0] ||
      "";

    const secondary = [
      addr.road && !primary.includes(addr.road) ? addr.road : null,
      addr.neighbourhood || addr.suburb,
      addr.city || addr.town || addr.village,
    ]
      .filter(Boolean)
      .slice(0, 2)
      .join(", ");

    return [primary, secondary].filter(Boolean).join(", ");
  } catch {
    return "";
  }
}

async function searchPlaces(query: string, center?: LatLng): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      format: "json",
      addressdetails: "1",
      q: query,
      limit: "7",
      dedupe: "1",
      "accept-language": "en",
    });

    if (center) {
      params.set(
        "viewbox",
        `${center.lng - 0.5},${center.lat + 0.5},${center.lng + 0.5},${center.lat - 0.5}`,
      );
      params.set("bounded", "0");
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { "Accept-Language": "en" } },
    );
    return await res.json();
  } catch {
    return [];
  }
}

function getNameFromResult(result: any): string {
  const addr = result.address ?? {};

  // Named places — use display_name[0] because addr fields strip
  // prefixes like "Hotel", "The", etc. from the actual name
  const isNamedPlace =
    addr.amenity ||
    addr.building ||
    addr.tourism ||
    addr.shop ||
    addr.office ||
    addr.leisure ||
    addr.historic;

  if (isNamedPlace) {
    return result.display_name?.split(",")[0]?.trim() ?? addr.amenity ?? "";
  }

  // Roads and admin areas — address fields are fine
  return (
    addr.road ||
    addr.neighbourhood ||
    addr.suburb ||
    addr.village ||
    addr.town ||
    addr.city ||
    result.display_name?.split(",")[0] ||
    ""
  );
}

// ─── LOCATION NAME DISPLAY ────────────────────────────────────────────────────

function LocationNameDisplay({
  name,
  geocoding,
  fallback = "No location selected",
  onNameClick,
}: {
  name: string;
  geocoding: boolean;
  fallback?: string;
  onNameClick?: (name: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (!name) return;
    navigator.clipboard.writeText(name).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
    onNameClick?.(name);
  };

  const [primary, ...rest] = name ? name.split(", ") : [];
  const secondary = rest.join(", ");

  return (
    <div className="flex items-start gap-2 min-h-[24px]">
      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
      {geocoding ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Getting address…
        </div>
      ) : name ? (
        <button
          type="button"
          onClick={handleClick}
          className="flex flex-col text-left group"
          title="Click to copy"
        >
          <span className="text-xs font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors">
            {copied ? "Copied!" : primary}
          </span>
          {secondary && !copied && (
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              {secondary}
            </span>
          )}
        </button>
      ) : (
        <span className="text-xs text-muted-foreground italic">{fallback}</span>
      )}
    </div>
  );
}

// ─── READ-ONLY VIEW ───────────────────────────────────────────────────────────

function MapReadOnly({
  value,
  height,
  label,
}: {
  value?: LatLng;
  height: number;
  label?: string;
}) {
  const [locationName, setLocationName] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (!value) return;
    if (value.name) return setLocationName(value.name);
    setGeocoding(true);
    reverseGeocode(value.lat, value.lng).then((name) => {
      setGeocoding(false);
      if (name) setLocationName(name);
    });
  }, [value?.lat, value?.lng]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <Label className="text-sm font-medium text-primary">{label}</Label>
      )}
      {value ? (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="relative">
            <iframe
              width="100%"
              height={height}
              style={{ border: 0, display: "block" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${value.lat},${value.lng}&z=15&output=embed`}
            />

            <a
              href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-10"
            >
              <Badge
                variant="secondary"
                className="gap-1.5 shadow-md cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                <MapPin className="h-3 w-3" />
                Open in Google Maps
                <ExternalLink className="h-3 w-3" />
              </Badge>
            </a>
          </div>
          <div className="px-4 py-3 bg-background border-t border-border space-y-2">
            {/* Read-only — no onNameClick needed, just copy on click */}
            <LocationNameDisplay name={locationName} geocoding={geocoding} />
            <div className="pl-5">
              <span className="font-mono text-[11px] text-muted-foreground">
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          No location set
        </div>
      )}
    </div>
  );
}

// ─── INTERACTIVE MAP ──────────────────────────────────────────────────────────

function MapInteractive({
  value,
  onChange,
  onLocationName,
  defaultCenter,
  defaultZoom,
  label,
  required,
  height,
}: Omit<MapPickerProps, "readOnly"> & {
  defaultCenter: LatLng;
  defaultZoom: number;
  height: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>(null);

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [tileType, setTileType] = useState<TileType>("road");
  const [latInput, setLatInput] = useState(
    String(value?.lat ?? defaultCenter.lat),
  );
  const [lngInput, setLngInput] = useState(
    String(value?.lng ?? defaultCenter.lng),
  );
  const [locationName, setLocationName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // ── Update coords + reverse geocode ──────────────────────────────────────
  const updateCoords = useCallback(
    async (lat: number, lng: number, skipGeocode = false) => {
      const rounded = {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
      };
      setLatInput(String(rounded.lat));
      setLngInput(String(rounded.lng));
      onChange?.(rounded);

      if (!skipGeocode && onLocationName) {
        setGeocoding(true);
        const name = await reverseGeocode(rounded.lat, rounded.lng);
        setGeocoding(false);
        if (name) {
          setLocationName(name);
          onLocationName(name);
        }
      }
    },
    [onChange, onLocationName],
  );

  // ── Init Leaflet with Google tiles ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if ((mapRef.current as any)._leaflet_id) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

      setupLeafletIcons(L);

      const center = valueRef.current ?? defaultCenter;

      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: defaultZoom,
        zoomControl: true,
      });

      const tileLayer = L.tileLayer(TILE_URLS.road, {
        attribution: '© <a href="https://maps.google.com">Google Maps</a>',
        maxZoom: 20,
        tileSize: 256,
        subdomains: TILE_SUBDOMAINS,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const marker = L.marker([center.lat, center.lng], {
        draggable: true,
      }).addTo(map);

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateCoords(lat, lng);
      });

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        updateCoords(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setIsLoaded(true);

      if (valueRef.current) {
        setLatInput(String(valueRef.current.lat));
        setLngInput(String(valueRef.current.lng));
        reverseGeocode(valueRef.current.lat, valueRef.current.lng).then(
          (name) => {
            if (name) setLocationName(name);
          },
        );
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // ── Sync external value ───────────────────────────────────────────────────
  useEffect(() => {
    if (!value || !isLoaded || !mapInstanceRef.current) return;
    markerRef.current?.setLatLng([value.lat, value.lng]);
    mapInstanceRef.current.panTo([value.lat, value.lng]);
    setLatInput(String(value.lat));
    setLngInput(String(value.lng));
    reverseGeocode(value.lat, value.lng).then((name) => {
      if (name) setLocationName(name);
    });
  }, [value?.lat, value?.lng, isLoaded]);

  // ── Tile switcher ─────────────────────────────────────────────────────────
  const handleTileType = (type: TileType) => {
    setTileType(type);
    tileLayerRef.current?.setUrl(TILE_URLS[type]);
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearch(q);
    clearTimeout(searchDebounce.current!);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      const center = mapInstanceRef.current
        ? (() => {
            const c = mapInstanceRef.current.getCenter();
            return { lat: c.lat, lng: c.lng };
          })()
        : (valueRef.current ?? defaultCenter);
      const data = await searchPlaces(q, center);
      setSearchResults(data);
      setSearching(false);
    }, 500);
  };

  // ── Select search result ──────────────────────────────────────────────────
  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    updateCoords(lat, lng, true);
    markerRef.current?.setLatLng([lat, lng]);

    if (result.boundingbox) {
      const [south, north, west, east] = result.boundingbox.map(parseFloat);
      mapInstanceRef.current?.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        {
          maxZoom: 17,
          padding: [20, 20],
        },
      );
    } else {
      mapInstanceRef.current?.setView([lat, lng], 17);
    }

    const shortName = getNameFromResult(result); // fixed
    const contextName =
      result.display_name?.split(",").slice(1, 3).join(", ").trim() ?? "";
    const fullLabel = [shortName, contextName].filter(Boolean).join(", ");

    if (fullLabel) {
      setLocationName(fullLabel);
      onLocationName?.(fullLabel); // ← pass fullLabel not just shortName
    }

    // Show the exact name in the search box
    setSearch(shortName || result.display_name?.split(",")[0] || "");
    setSearchResults([]);
  };

  // ── Manual coords ─────────────────────────────────────────────────────────
  const applyManual = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) return;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    updateCoords(lat, lng);
    markerRef.current?.setLatLng([lat, lng]);
    mapInstanceRef.current?.panTo([lat, lng]);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <Label className="text-sm font-medium text-primary">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          {/* Search */}
          <div className="relative border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2 bg-background">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a place..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searching && (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-[9999] bg-popover border border-border rounded-b-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((r, i) => {
                  const primaryName = r.display_name?.split(",")[0] ?? "";
                  const context =
                    r.display_name?.split(",").slice(1, 3).join(",").trim() ??
                    "";
                  const type = r.type ?? r.class ?? "";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectResult(r)}
                      className="w-full text-left px-3 py-2 hover:bg-muted border-b border-border/50 last:border-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {primaryName}
                          </p>
                          {context && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {context}
                            </p>
                          )}
                          {type && (
                            <span className="text-[10px] text-primary/60 capitalize">
                              {type}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="relative">
            {!isLoaded && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/30 z-10"
                style={{ height }}
              >
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground">Loading map...</p>
              </div>
            )}
            <div ref={mapRef} style={{ height, width: "100%", zIndex: 0 }} />

            {/* Tile type toggle */}
            {isLoaded && (
              <div className="absolute top-3 right-3 flex gap-1 z-[9999]">
                {(["road", "satellite", "hybrid", "terrain"] as const).map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTileType(t)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize border transition-colors shadow-sm ${
                        tileType === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white/90 text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Coordinates panel */}
          <div className="border-t border-border bg-background px-4 py-3 space-y-3">
            <LocationNameDisplay
              name={locationName}
              geocoding={geocoding}
              onNameClick={(name) => onLocationName?.(name)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Latitude
                </Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyManual()}
                  className="font-mono text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Longitude
                </Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyManual()}
                  className="font-mono text-sm h-8"
                />
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={applyManual}
              className="w-full h-8 text-xs"
            >
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              Go to coordinates
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Click map or drag marker · Enter coords manually · Search by name
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function MapPicker({
  value,
  onChange,
  onLocationName,
  defaultCenter = { lat: 27.7172, lng: 85.324 },
  defaultZoom = 13,
  label,
  required,
  height = 400,
  readOnly = false,
}: MapPickerProps) {
  return readOnly ? (
    <MapReadOnly value={value} height={height} label={label} />
  ) : (
    <MapInteractive
      value={value}
      onChange={onChange}
      onLocationName={onLocationName}
      defaultCenter={defaultCenter}
      defaultZoom={defaultZoom}
      label={label}
      required={required}
      height={height}
    />
  );
}
