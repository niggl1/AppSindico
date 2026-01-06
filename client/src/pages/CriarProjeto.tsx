import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Smartphone, FileBarChart, BookOpen, Plus, ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { useLocation } from "wouter";
import AssistenteCriacao from "@/components/AssistenteCriacao";

export default function CriarProjeto() {
  const [, setLocation] = useLocation();
  const [mostrarAssistente, setMostrarAssistente] = useState(false);

  const projetos = [
    {
      id: "app",
      titulo: "Apps Criados",
      descricao: "Crie apps personalizados para seu condomínio",
      icone: Smartphone,
      cor: "bg-blue-500",
      corBorda: "border-blue-200",
      corFundo: "bg-blue-50",
      corTexto: "text-blue-600",
      corBotao: "bg-blue-500 hover:bg-blue-600",
      rota: "/dashboard/apps/novo",
      textoBotao: "Criar App"
    },
    {
      id: "relatorio",
      titulo: "Relatórios Criados",
      descricao: "Gere relatórios detalhados com sua marca",
      icone: FileBarChart,
      cor: "bg-emerald-500",
      corBorda: "border-emerald-200",
      corFundo: "bg-emerald-50",
      corTexto: "text-emerald-600",
      corBotao: "bg-emerald-500 hover:bg-emerald-600",
      rota: "/dashboard/relatorios/novo",
      textoBotao: "Criar Relatório"
    },
    {
      id: "revista",
      titulo: "Revistas Criadas",
      descricao: "Crie revistas digitais interativas",
      icone: BookOpen,
      cor: "bg-purple-500",
      corBorda: "border-purple-200",
      corFundo: "bg-purple-50",
      corTexto: "text-purple-600",
      corBotao: "bg-purple-500 hover:bg-purple-600",
      rota: "/dashboard/revistas",
      textoBotao: "Criar Revista"
    }
  ];

  const primeirosPassos = [
    {
      numero: 1,
      titulo: "Cadastre seu Condomínio",
      descricao: "Adicione nome, endereço e logo",
      rota: "/dashboard/condominio"
    },
    {
      numero: 2,
      titulo: "Adicione Funcionários",
      descricao: "Cadastre a equipe do condomínio",
      rota: "/dashboard/funcionarios"
    },
    {
      numero: 3,
      titulo: "Crie seu Primeiro Projeto",
      descricao: "App, revista ou relatório",
      rota: null // Já está nesta página
    },
    {
      numero: 4,
      titulo: "Compartilhe com Moradores",
      descricao: "Gere o link e divulgue",
      rota: "/dashboard/moradores"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Criar Novo Projeto</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Escolha o tipo de projeto
          </h1>
          <p className="text-slate-600">
            Crie apps, projetos digitais e relatórios para seu condomínio.
          </p>
        </div>

        {/* Botão do Assistente de Criação */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-purple-50/50 to-blue-50/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
                  <Wand2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    Assistente de Criação
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  </h2>
                  <p className="text-slate-600 max-w-lg">
                    Deixe-nos guiá-lo passo a passo na criação do seu projeto. 
                    Escolha o tipo, configure módulos e personalize o visual em apenas 5 passos.
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                onClick={() => setMostrarAssistente(true)}
              >
                <Wand2 className="h-5 w-5 mr-2" />
                Iniciar Assistente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Separador */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-sm text-slate-400 font-medium">ou crie diretamente</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Cards de Criação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {projetos.map((projeto) => {
            const Icone = projeto.icone;
            return (
              <Card 
                key={projeto.id}
                className={`relative overflow-hidden border-2 ${projeto.corBorda} hover:shadow-lg transition-all duration-300 group`}
              >
                {/* Faixa decorativa no topo */}
                <div className={`h-1.5 ${projeto.cor}`} />
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${projeto.corFundo}`}>
                      <Icone className={`h-6 w-6 ${projeto.corTexto}`} />
                    </div>
                    <span className="text-3xl font-bold text-slate-300">0</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {projeto.titulo}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    {projeto.descricao}
                  </p>
                  
                  <Button 
                    className={`w-full ${projeto.corBotao} text-white group-hover:shadow-md transition-all`}
                    onClick={() => setLocation(projeto.rota)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {projeto.textoBotao}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Primeiros Passos */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">
                Primeiros Passos
              </h2>
              <p className="text-sm text-slate-500">
                Configure seu condomínio para começar
              </p>
            </div>
            
            <div className="space-y-4">
              {primeirosPassos.map((passo) => (
                <div 
                  key={passo.numero}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    passo.rota 
                      ? "hover:bg-slate-50 cursor-pointer" 
                      : "bg-primary/5 border border-primary/20"
                  }`}
                  onClick={() => passo.rota && setLocation(passo.rota)}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    passo.rota === null 
                      ? "bg-primary text-white" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {passo.numero}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${passo.rota === null ? "text-primary" : "text-slate-900"}`}>
                      {passo.titulo}
                    </h3>
                    <p className="text-sm text-slate-500">{passo.descricao}</p>
                  </div>
                  {passo.rota && (
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  )}
                  {passo.rota === null && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Você está aqui
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal do Assistente de Criação */}
      <Dialog open={mostrarAssistente} onOpenChange={setMostrarAssistente}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AssistenteCriacao 
            onClose={() => setMostrarAssistente(false)}
            onComplete={() => setMostrarAssistente(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
