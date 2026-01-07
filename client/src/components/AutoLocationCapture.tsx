import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface LocationData {
  latitude: string;
  longitude: string;
  endereco: string;
  accuracy?: number;
}

interface AutoLocationCaptureProps {
  onLocationCapture: (location: LocationData) => void;
  autoCapture?: boolean;
  showStatus?: boolean;
  className?: string;
}

export function AutoLocationCapture({
  onLocationCapture,
  autoCapture = true,
  showStatus = true,
  className = "",
}: AutoLocationCaptureProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const captureLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Geolocalização não suportada neste navegador");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Tentar obter endereço via reverse geocoding
        let endereco = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'pt-BR',
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              endereco = data.display_name;
            }
          }
        } catch (e) {
          console.log("Não foi possível obter endereço, usando coordenadas");
        }

        const location: LocationData = {
          latitude: latitude.toFixed(8),
          longitude: longitude.toFixed(8),
          endereco,
          accuracy,
        };

        setLocationData(location);
        setStatus("success");
        onLocationCapture(location);
      },
      (error) => {
        setStatus("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage("Permissão de localização negada. Por favor, permita o acesso à localização.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Localização indisponível. Verifique se o GPS está ativado.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Tempo esgotado ao obter localização. Tente novamente.");
            break;
          default:
            setErrorMessage("Erro ao obter localização.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [onLocationCapture]);

  // Captura automática ao montar o componente
  useEffect(() => {
    if (autoCapture && status === "idle") {
      captureLocation();
    }
  }, [autoCapture, status, captureLocation]);

  if (!showStatus) {
    return null;
  }

  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "loading" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-muted-foreground">Capturando localização...</span>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-green-600">Localização capturada!</span>
                {locationData && (
                  <a
                    href={`https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    Ver no Google Maps
                  </a>
                )}
              </div>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">{errorMessage}</span>
            </>
          )}
          {status === "idle" && (
            <>
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">Aguardando captura de localização...</span>
            </>
          )}
        </div>
        
        {(status === "error" || status === "success") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={captureLocation}
            className="h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            {status === "error" ? "Tentar novamente" : "Atualizar"}
          </Button>
        )}
      </div>
      
      {status === "success" && locationData && (
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">Coordenadas:</span>
            <span>{locationData.latitude}, {locationData.longitude}</span>
          </div>
          {locationData.accuracy && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Precisão:</span>
              <span>±{Math.round(locationData.accuracy)}m</span>
            </div>
          )}
          <div className="flex items-start gap-1 mt-1">
            <span className="font-medium shrink-0">Endereço:</span>
            <span className="line-clamp-2">{locationData.endereco}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoLocationCapture;
