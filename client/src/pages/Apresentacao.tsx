import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  bgColor: string;
  textColor: string;
}

export default function Apresentacao() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const presentationRef = useRef<HTMLDivElement>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const slides: Slide[] = [
    {
      id: 1,
      title: 'APP MANUTENÇÃO',
      subtitle: 'Sistema Universal de Gestão de Manutenção',
      content: (
        <div className="text-center space-y-6">
          <p className="text-2xl text-gray-600">
            A plataforma completa para gerenciar manutenções de qualquer escala
          </p>
          <div className="flex justify-center gap-4 text-3xl">
            <span>🏢</span>
            <span>🏭</span>
            <span>🏪</span>
            <span>🏥</span>
            <span>🏫</span>
          </div>
        </div>
      ),
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      textColor: 'text-gray-900'
    },
    {
      id: 2,
      title: 'Bem-vindo ao Futuro da Manutenção',
      subtitle: 'Desenvolvido para todos os tipos de operação',
      content: (
        <div className="grid grid-cols-2 gap-6">
          {[
            { icon: '🏢', text: 'Manutenções Prediais' },
            { icon: '🏭', text: 'Manutenções Industriais' },
            { icon: '🏪', text: 'Manutenções Comerciais' },
            { icon: '🏥', text: 'Manutenções Hospitalares' },
            { icon: '🏫', text: 'Manutenções Escolares' },
            { icon: '⚙️', text: 'Máquinas e Equipamentos' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md"
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="font-semibold text-gray-800">{item.text}</span>
            </motion.div>
          ))}
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 3,
      title: 'Dashboard Profissional',
      subtitle: '📊 Visão Completa do Seu Sistema',
      content: (
        <div className="flex justify-center">
          <img src="/sistema-dashboard.png" alt="Dashboard" className="w-full max-w-4xl rounded-lg shadow-lg" />
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 4,
      title: 'Ordens de Serviço',
      subtitle: '📋 Gestão Completa de Tarefas',
      content: (
        <div className="flex justify-center">
          <img src="/sistema-ordens.png" alt="Ordens de Serviço" className="w-full max-w-4xl rounded-lg shadow-lg" />
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 5,
      title: 'Relatórios Executivos',
      subtitle: '📊 Análises e Métricas Avançadas',
      content: (
        <div className="flex justify-center">
          <img src="/sistema-relatorios.png" alt="Relatórios" className="w-full max-w-4xl rounded-lg shadow-lg" />
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 6,
      title: 'App Mobile',
      subtitle: '📱 Manutenção na Palma da Sua Mão',
      content: (
        <div className="flex justify-center">
          <img src="/sistema-mobile.png" alt="App Mobile" className="max-h-96 rounded-lg shadow-lg" />
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 7,
      title: 'Vistorias Detalhadas',
      subtitle: '🔍 Inspeções Profissionais',
      content: (
        <div className="flex justify-center">
          <img src="/sistema-vistorias.png" alt="Vistorias" className="w-full max-w-4xl rounded-lg shadow-lg" />
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 8,
      title: 'Gestão de Equipe',
      subtitle: '👥 Controle de Técnicos e Desempenho',
      content: (
        <div className="flex justify-center">
          <img src="/sistema-equipe.png" alt="Gestão de Equipe" className="w-full max-w-4xl rounded-lg shadow-lg" />
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 9,
      title: 'Plano Individual',
      subtitle: 'R$ 99/mês',
      content: (
        <div className="space-y-6">
          <p className="text-xl text-gray-700 font-semibold">Perfeito para profissionais autônomos</p>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl">
            <ul className="space-y-3 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>1 usuário ativo</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Ordens de serviço ilimitadas</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Suporte técnico</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>App mobile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Relatórios básicos</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 10,
      title: 'Plano Pequenas Equipes',
      subtitle: 'R$ 199/mês',
      content: (
        <div className="space-y-6">
          <p className="text-xl text-gray-700 font-semibold">Ideal para pequenas e médias empresas</p>
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-8 rounded-xl border-2 border-orange-500">
            <ul className="space-y-3 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Até 3 usuários</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Ordens de serviço ilimitadas</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Suporte técnico prioritário</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>App mobile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Relatórios avançados</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Integração com APIs</span>
              </li>
            </ul>
          </div>
          <p className="text-center text-orange-600 font-bold text-lg">RECOMENDADO</p>
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 11,
      title: 'Plano Equipes Médias',
      subtitle: 'R$ 299/mês',
      content: (
        <div className="space-y-6">
          <p className="text-xl text-gray-700 font-semibold">Para operações em larga escala</p>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl">
            <ul className="space-y-3 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Até 5 usuários</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Ordens de serviço ilimitadas</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Suporte técnico 24/7</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>App mobile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Relatórios customizados</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Integração completa</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Backup automático</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 12,
      title: 'Termos do Contrato',
      subtitle: 'Transparência e Segurança',
      content: (
        <div className="space-y-4">
          {[
            { title: 'Período', desc: '1 ano renovável automaticamente' },
            { title: 'Reajuste', desc: 'Anual conforme IPCA ou mudança de plano' },
            { title: 'Bloqueio', desc: 'Após 5 dias corridos de atraso' },
            { title: 'Cancelamento', desc: '30 dias de aviso prévio' },
            { title: 'Penalidade', desc: '1 mês adicional se aviso não for respeitado' },
            { title: 'Suporte', desc: 'Disponível em todos os planos' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500"
            >
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 13,
      title: 'Por Que Escolher APP MANUTENÇÃO?',
      subtitle: 'Diferenciais que fazem a diferença',
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[
            '✓ Sem taxa de adesão',
            '✓ Sem compromisso longo',
            '✓ Suporte dedicado',
            '✓ Plataforma intuitiva',
            '✓ Segurança garantida',
            '✓ Integração fácil',
            '✓ Relatórios profissionais',
            '✓ Acesso mobile completo'
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg text-lg font-semibold text-gray-900"
            >
              {item}
            </motion.div>
          ))}
        </div>
      ),
      bgColor: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 14,
      title: 'Próximos Passos',
      subtitle: 'Comece sua transformação agora',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-4 gap-4">
            {[
              { num: '1', title: 'Escolha', desc: 'Seu plano' },
              { num: '2', title: 'Teste', desc: '7 dias grátis' },
              { num: '3', title: 'Configure', desc: 'Sua conta' },
              { num: '4', title: 'Comece', desc: 'A usar' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h4 className="font-bold text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-700">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xl text-gray-700">
            <strong>Estamos prontos para transformar sua gestão de manutenção!</strong>
          </p>
        </div>
      ),
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      textColor: 'text-gray-900'
    }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/apresentacao_sistema.pdf';
    link.download = 'apresentacao_sistema.pdf';
    link.click();
  };

  const sharePresentation = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'APP MANUTENÇÃO - Apresentação',
        text: 'Confira nossa apresentação do sistema de gestão de manutenção',
        url: url
      });
    } else {
      alert('Link: ' + url);
    }
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 500);
  };

  const slide = slides[currentSlide];

  return (
    <>
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-slide {
            page-break-after: always;
            page-break-inside: avoid;
            width: 100%;
            height: 100vh;
            margin: 0;
            padding: 40px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: white !important;
            color: #1f2937 !important;
            border: none !important;
          }
          .print-slide img {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
          }
          .print-slide h1 {
            font-size: 48px;
            margin: 0 0 20px 0;
            color: #1f2937;
            page-break-after: avoid;
          }
          .print-slide h2 {
            font-size: 28px;
            margin: 0 0 30px 0;
            color: #666;
            page-break-after: avoid;
          }
          .print-slide .print-content {
            font-size: 16px;
            line-height: 1.6;
            color: #1f2937;
            page-break-inside: avoid;
          }
          .print-slide ul {
            margin: 20px 0;
            padding-left: 30px;
          }
          .print-slide li {
            margin: 10px 0;
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-100 flex flex-col" ref={presentationRef}>
        {!isPrintMode && (
          <>
            {/* Header */}
            <div className="bg-white shadow-md p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <img src="/LogoManutenção2.png" alt="APP MANUTENÇÃO" className="h-12" />
                <span className="text-xl font-bold text-gray-900">Apresentação</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sharePresentation}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className={`w-full max-w-5xl ${slide.bgColor} rounded-2xl shadow-2xl p-12 min-h-96 flex flex-col justify-center ${slide.textColor}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="text-5xl font-bold mb-2">{slide.title}</h1>
                      {slide.subtitle && (
                        <p className="text-xl text-gray-600">{slide.subtitle}</p>
                      )}
                    </div>
                    <div className="text-lg">{slide.content}</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white shadow-md p-6 flex items-center justify-between no-print">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-semibold text-gray-700">
                  {currentSlide + 1} / {slides.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Slide Indicators */}
              <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide
                        ? 'bg-orange-500 w-8'
                        : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isAutoPlay ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={isAutoPlay ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  {isAutoPlay ? '⏸ Pausar' : '▶ Auto'}
                </Button>
              </div>
            </div>
          </>
        )}
        {isPrintMode && (
          <div className="print-view">
            {slides.map((slide, idx) => (
              <div key={idx} className="print-slide">
                <div>
                  <h1>{slide.title}</h1>
                  {slide.subtitle && <h2>{slide.subtitle}</h2>}
                  <div className="print-content">
                    {slide.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
