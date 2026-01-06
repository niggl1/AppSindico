import { useEffect, useRef } from "react";
import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationMiniMapProps {
  latitude: string;
  longitude: string;
  endereco?: string;
  height?: number;
}

export function LocationMiniMap({ latitude, longitude, endereco, height = 200 }: LocationMiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Verificar se as coordenadas são válidas
  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  // URL do OpenStreetMap embed (gratuito, sem API key)
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.003},${lng + 0.005},${lat + 0.003}&layer=mapnik&marker=${lat},${lng}`;
  
  // URL para abrir no Google Maps
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  
  // URL para abrir no OpenStreetMap
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  return (
    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-green-100 border-b border-green-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Localização Capturada</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-green-700 hover:text-green-900 hover:bg-green-200"
            onClick={() => window.open(googleMapsUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Google Maps
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-green-700 hover:text-green-900 hover:bg-green-200"
            onClick={() => window.open(osmUrl, '_blank')}
          >
            <Navigation className="h-3 w-3 mr-1" />
            OpenStreetMap
          </Button>
        </div>
      </div>

      {/* Mapa */}
      <div ref={mapRef} style={{ height: `${height}px`, width: '100%' }}>
        <iframe
          src={osmEmbedUrl}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            display: 'block'
          }}
          title="Mapa de localização"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Informações */}
      <div className="px-3 py-2 bg-white border-t border-green-200">
        <div className="text-xs text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium">Coordenadas:</span>
            <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
          </div>
          {endereco && (
            <div className="flex items-start gap-1">
              <span className="font-medium shrink-0">Endereço:</span>
              <span className="line-clamp-2">{endereco}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
