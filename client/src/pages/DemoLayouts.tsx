import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LayoutGrid, 
  BookOpen, 
  ScrollText, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Megaphone,
  Calendar,
  Vote,
  Users,
  Package,
  Car,
  Heart,
  Shield,
  Building2,
  FileText,
  Image,
  Star
} from "lucide-react";
import { Link } from "wouter";

// Dados de exemplo para demonstração
const demoContent = [
  { 
    id: 1, 
    title: "Avisos Importantes", 
    description: "Comunicados da administração para todos os moradores",
    icon: Megaphone,
    color: "from-amber-500 to-orange-600",
    content: "A reunião de condomínio será realizada no dia 15 de janeiro às 19h no salão de festas. Pauta: aprovação de orçamento anual e eleição de síndico."
  },
  { 
    id: 2, 
    title: "Eventos do Mês", 
    description: "Confira a agenda de atividades do condomínio",
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
    content: "Festa de Ano Novo - 31/12 às 22h | Aula de Yoga - Sábados às 9h | Reunião de Pais - 10/01 às 18h"
  },
  { 
    id: 3, 
    title: "Votações Ativas", 
    description: "Participe das decisões do condomínio",
    icon: Vote,
    color: "from-emerald-500 to-teal-600",
    content: "Votação aberta: Instalação de câmeras no estacionamento. Vote até 20/01. Participação atual: 45%"
  },
  { 
    id: 4, 
    title: "Funcionários", 
    description: "Conheça a equipe que cuida do seu condomínio",
    icon: Users,
    color: "from-purple-500 to-pink-600",
    content: "João Silva - Porteiro | Maria Santos - Zeladora | Carlos Oliveira - Jardineiro | Ana Costa - Faxineira"
  },
  { 
    id: 5, 
    title: "Classificados", 
    description: "Anúncios dos moradores",
    icon: Package,
    color: "from-cyan-500 to-blue-600",
    content: "Vendo sofá 3 lugares - R$ 800 | Aulas de inglês - Apto 302 | Bicicleta infantil - R$ 150"
  },
  { 
    id: 6, 
    title: "Caronas", 
    description: "Compartilhe viagens com vizinhos",
    icon: Car,
    color: "from-rose-500 to-red-600",
    content: "Carona para Centro - Seg a Sex 7h30 | Carona para Shopping - Sábados 14h"
  },
  { 
    id: 7, 
    title: "Achados e Perdidos", 
    description: "Objetos encontrados nas áreas comuns",
    icon: Heart,
    color: "from-pink-500 to-rose-600",
    content: "Chave encontrada no playground | Óculos de sol na piscina | Guarda-chuva no hall"
  },
  { 
    id: 8, 
    title: "Segurança", 
    description: "Dicas e informações de segurança",
    icon: Shield,
    color: "from-slate-500 to-gray-600",
    content: "Lembre-se de sempre identificar visitantes na portaria. Em caso de emergência, ligue 190."
  },
  { 
    id: 9, 
    title: "Sobre o Condomínio", 
    description: "Informações gerais",
    icon: Building2,
    color: "from-indigo-500 to-purple-600",
    content: "Residencial Jardins - Fundado em 2010 - 120 unidades - 4 torres - Área de lazer completa"
  },
];

// Layout Grid
function GridLayout() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {demoContent.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Layout Páginas (Flip)
function PagesLayout() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = demoContent.length;

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const item = demoContent[currentPage];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-full max-w-2xl">
        {/* Navegação */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevPage}
            className="rounded-full shadow-lg bg-white hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextPage}
            className="rounded-full shadow-lg bg-white hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Página */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="perspective-1000"
          >
            <Card className="min-h-[400px] shadow-2xl border-2">
              <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-serif">{item.title}</CardTitle>
                <CardDescription className="text-base">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg text-center leading-relaxed">{item.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Indicador de página */}
        <div className="flex justify-center gap-2 mt-6">
          {demoContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentPage 
                  ? "bg-primary w-8" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Página {currentPage + 1} de {totalPages}
        </p>
      </div>
    </motion.div>
  );
}

// Layout Scroll
function ScrollLayout() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="space-y-8">
        {demoContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex gap-6 items-start">
              {/* Linha do tempo */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                {index < demoContent.length - 1 && (
                  <div className="w-0.5 h-full min-h-[60px] bg-gradient-to-b from-gray-300 to-transparent mt-2" />
                )}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 pb-8">
                <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-foreground">{item.content}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DemoLayouts() {
  const [activeLayout, setActiveLayout] = useState<"grid" | "pages" | "scroll">("grid");

  const layouts = [
    { 
      id: "grid" as const, 
      name: "App (Grid)", 
      icon: LayoutGrid, 
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Layout em grade ideal para dashboards"
    },
    { 
      id: "pages" as const, 
      name: "Revista (Páginas)", 
      icon: BookOpen, 
      color: "bg-emerald-600 hover:bg-emerald-700",
      description: "Navegação página a página como revista"
    },
    { 
      id: "scroll" as const, 
      name: "Relatório (Scroll)", 
      icon: ScrollText, 
      color: "bg-purple-600 hover:bg-purple-700",
      description: "Documento contínuo com rolagem"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-xl font-serif font-bold">
              Demonstração de Layouts
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Seletor de Layout */}
      <section className="py-8 border-b bg-secondary/30">
        <div className="container">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Escolha o Tipo de Visualização
            </h2>
            <p className="text-muted-foreground">
              Veja como o mesmo conteúdo pode ser apresentado de formas diferentes
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {layouts.map((layout) => (
              <Button
                key={layout.id}
                onClick={() => setActiveLayout(layout.id)}
                className={`h-auto py-4 px-6 flex-col gap-2 min-w-[180px] transition-all ${
                  activeLayout === layout.id 
                    ? `${layout.color} text-white shadow-lg scale-105` 
                    : "bg-white text-foreground border-2 hover:border-primary"
                }`}
                variant={activeLayout === layout.id ? "default" : "outline"}
              >
                <layout.icon className="w-8 h-8" />
                <span className="font-semibold">{layout.name}</span>
                <span className={`text-xs ${activeLayout === layout.id ? "text-white/80" : "text-muted-foreground"}`}>
                  {layout.description}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Área de Demonstração */}
      <section className="py-12">
        <div className="container">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              {layouts.find(l => l.id === activeLayout)?.icon && (
                <span className="w-5 h-5">
                  {(() => {
                    const Icon = layouts.find(l => l.id === activeLayout)!.icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </span>
              )}
              <span className="font-medium">
                Visualizando: {layouts.find(l => l.id === activeLayout)?.name}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeLayout === "grid" && <GridLayout key="grid" />}
            {activeLayout === "pages" && <PagesLayout key="pages" />}
            {activeLayout === "scroll" && <ScrollLayout key="scroll" />}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary/5 border-t">
        <div className="container text-center">
          <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
            Pronto para criar o seu?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Escolha o layout que melhor se adapta às necessidades do seu condomínio e comece a criar agora mesmo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard/revistas">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <LayoutGrid className="w-5 h-5 mr-2" />
                Criar Meu App
              </Button>
            </Link>
            <Link href="/dashboard/revistas">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <BookOpen className="w-5 h-5 mr-2" />
                Criar Minha Revista
              </Button>
            </Link>
            <Link href="/dashboard/revistas">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <ScrollText className="w-5 h-5 mr-2" />
                Criar Relatório
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
