import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import ManutencoesPage from "./ManutencoesPage";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: condominios, isLoading: condominiosLoading } = trpc.condominio.list.useQuery();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading || condominiosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const condominioId = condominios?.[0]?.id || 0;

  return (
    <div className="min-h-screen bg-background">
      <ManutencoesPage condominioId={condominioId} />
    </div>
  );
}
