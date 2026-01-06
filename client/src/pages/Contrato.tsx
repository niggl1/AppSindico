import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { FileText, Download, ArrowLeft, ShieldCheck, Phone, Mail, Globe } from "lucide-react";
import { Link } from "wouter";

const meses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

const planos = [
  { value: "sindicos", label: "Síndicos - R$ 99,00/mês", preco: "R$ 99,00 (noventa e nove reais)" },
  { value: "condominios", label: "Condomínios - R$ 199,00/mês", preco: "R$ 199,00 (cento e noventa e nove reais)" },
  { value: "administradoras", label: "Administradoras - R$ 299,00/mês", preco: "R$ 299,00 (duzentos e noventa e nove reais)" },
];

export default function Contrato() {
  const contratoRef = useRef<HTMLDivElement>(null);
  const hoje = new Date();
  
  const [formData, setFormData] = useState({
    razaoSocial: "",
    endereco: "",
    nomeResponsavel: "",
    cidade: "São Paulo",
    dia: hoje.getDate().toString(),
    mes: meses[hoje.getMonth()],
    ano: hoje.getFullYear().toString(),
    plano: "condominios",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const planoSelecionado = planos.find(p => p.value === formData.plano);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Site
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <img src="/logo-appsindico-texto.png" alt="App Síndico" className="h-6 object-contain" />
            </div>
            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 gap-2">
              <Download className="h-4 w-4" />
              Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 print:py-0">
        <div className="grid lg:grid-cols-[350px_1fr] gap-8 print:block">
          {/* Formulário de Preenchimento */}
          <div className="print:hidden">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Preencha seus Dados</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plano">Plano Escolhido</Label>
                    <Select value={formData.plano} onValueChange={(v) => handleChange("plano", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planos.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="razaoSocial">Razão Social ou Nome do Condomínio ou Nome do Síndico</Label>
                    <Input
                      id="razaoSocial"
                      placeholder="Ex: Condomínio Residencial Jardins"
                      value={formData.razaoSocial}
                      onChange={(e) => handleChange("razaoSocial", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endereco">Endereço Completo</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, Número, Bairro"
                      value={formData.endereco}
                      onChange={(e) => handleChange("endereco", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nomeResponsavel">Nome Completo do Responsável</Label>
                    <Input
                      id="nomeResponsavel"
                      placeholder="Nome do síndico ou responsável"
                      value={formData.nomeResponsavel}
                      onChange={(e) => handleChange("nomeResponsavel", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleChange("cidade", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dia">Dia</Label>
                      <Input
                        id="dia"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.dia}
                        onChange={(e) => handleChange("dia", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ano">Ano</Label>
                      <Input
                        id="ano"
                        type="number"
                        value={formData.ano}
                        onChange={(e) => handleChange("ano", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mes">Mês</Label>
                    <Select value={formData.mes} onValueChange={(v) => handleChange("mes", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meses.map(m => (
                          <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">
                    Após preencher, clique em "Imprimir / Salvar PDF" para gerar o contrato.
                  </p>
                  <Button onClick={handlePrint} className="w-full bg-primary hover:bg-primary/90 gap-2">
                    <Download className="h-4 w-4" />
                    Imprimir / Salvar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contrato */}
          <div ref={contratoRef} className="bg-white rounded-lg shadow-sm border border-gray-200 print:shadow-none print:border-none">
            <div className="p-8 md:p-12 print:p-8">
              {/* Cabeçalho do Contrato */}
              <div className="text-center mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  CONTRATO DE LICENÇA DE USO DE SOFTWARE
                </h1>
                <p className="text-gray-600">
                  APP SÍNDICO - Plataforma Digital para Condomínios
                </p>
              </div>

              {/* 1. IDENTIFICAÇÃO DAS PARTES */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-primary border-l-4 border-primary pl-3 mb-4">
                  1. IDENTIFICAÇÃO DAS PARTES
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">CONTRATADA (Fornecedora):</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                    <div className="space-y-1">
                      <p><strong>Razão Social:</strong> App Group LTDA</p>
                      <p><strong>Endereço:</strong> Av. Paulista, 1106, Sala 01, Andar 16</p>
                      <p><strong>CEP:</strong> 01310-914</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong>CNPJ:</strong> 51.797.070/0001-53</p>
                      <p><strong>Bairro/Cidade:</strong> Bela Vista, São Paulo - SP</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-gray-700">
                    <p><strong>Sistema:</strong> APP SÍNDICO</p>
                    <p><strong>Site:</strong> www.appsindico.com.br</p>
                    <p><strong>Contato:</strong> (81) 99961-8516 (atendimento exclusivo via WhatsApp) | contato@appsindico.com.br</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">CONTRATANTE (Cliente):</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Razão Social ou Nome do Condomínio ou Nome do Síndico</p>
                      <div className="border-b-2 border-gray-400 min-h-[28px] px-2 py-1 bg-yellow-50">
                        {formData.razaoSocial || <span className="text-gray-400 italic">Digite a Razão Social, Nome do Condomínio ou Nome do Síndico</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Endereço (Rua, Número, Bairro)</p>
                      <div className="border-b-2 border-gray-400 min-h-[28px] px-2 py-1 bg-yellow-50">
                        {formData.endereco || <span className="text-gray-400 italic">Rua, Número, Bairro</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nome completo do responsável</p>
                      <div className="border-b-2 border-gray-400 min-h-[28px] px-2 py-1 bg-yellow-50">
                        {formData.nomeResponsavel || <span className="text-gray-400 italic">Nome completo do responsável</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. OBJETO */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-primary border-l-4 border-primary pl-3 mb-4">
                  2. OBJETO
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  O presente contrato tem por objeto a licença de uso do software <strong>"APP SÍNDICO"</strong>, 
                  disponibilizado na modalidade SaaS (Software as a Service), para gestão de comunicação, 
                  apps, projetos digitais e relatórios em condomínios, destinado a síndicos, condomínios e administradoras.
                </p>
              </section>

              {/* 3. VALORES E PAGAMENTO */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-primary border-l-4 border-primary pl-3 mb-4">
                  3. VALORES E PAGAMENTO
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Pela licença de uso do software, a CONTRATANTE pagará à CONTRATADA o valor mensal de{" "}
                  <strong>{planoSelecionado?.preco}</strong>, referente ao plano selecionado.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Formas de Pagamento:</strong> Boleto bancário, cartão de crédito ou Pix.</li>
                  <li><strong>Dados para Pix:</strong> contato@appsindico.com.br</li>
                  <li>O não pagamento acarretará na suspensão temporária do acesso ao sistema após 5 dias de atraso.</li>
                </ul>
              </section>

              {/* 4. VIGÊNCIA E CANCELAMENTO */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-primary border-l-4 border-primary pl-3 mb-4">
                  4. VIGÊNCIA E CANCELAMENTO
                </h2>
                
                <div className="bg-primary/5 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-primary mb-2">Período de Testes (Trial)</h3>
                  <p className="text-gray-700 mb-2">
                    A CONTRATANTE terá direito a um período de <strong>7 (sete) dias gratuitos</strong> para teste do sistema, 
                    sem qualquer compromisso financeiro.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Após o 7º dia, será necessária a efetivação da contratação para continuidade do acesso.</li>
                    <li>Caso a contratação não seja realizada após o período de teste, <strong>todas as informações do condomínio, 
                    cadastros de moradores e registros de acesso serão excluídos automaticamente</strong>.</li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Após o período de testes e efetivação da contratação, este contrato terá validade de <strong>1 (um) ano</strong>, 
                  sendo renovado automaticamente por iguais períodos, salvo manifestação em contrário de qualquer das partes.
                </p>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Condições de Cancelamento</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Aviso Prévio:</strong> O cancelamento deve ser solicitado com <strong>30 (trinta) dias de antecedência</strong>.</li>
                    <li><strong>Penalidade por falta de aviso:</strong> Caso o aviso prévio não seja respeitado, será cobrada uma mensalidade adicional referente ao período de aviso.</li>
                    <li>Não há multa rescisória por fidelidade, apenas a necessidade do cumprimento do aviso prévio.</li>
                  </ul>
                </div>
              </section>

              {/* 5. RESPONSABILIDADES */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-primary border-l-4 border-primary pl-3 mb-4">
                  5. RESPONSABILIDADES
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  A CONTRATADA garante o funcionamento do software e o suporte técnico para dúvidas e correções de erros.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Importante:</strong> A CONTRATADA NÃO é responsável pela veracidade ou correção dos cadastros de moradores, 
                    apartamentos e demais informações do condomínio são de <strong>inteira e exclusiva responsabilidade</strong> dos 
                    usuários do condomínio (síndico, administradores, porteiros e moradores).
                  </p>
                </div>
              </section>

              {/* Data e Assinaturas */}
              <section className="mt-12 pt-8 border-t-2 border-gray-300">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 text-gray-700">
                    <span className="border-b-2 border-gray-400 min-w-[120px] px-2 py-1 bg-yellow-50 inline-block">
                      {formData.cidade || "Cidade"}
                    </span>
                    <span>,</span>
                    <span className="border-b-2 border-gray-400 min-w-[40px] px-2 py-1 bg-yellow-50 inline-block text-center">
                      {formData.dia}
                    </span>
                    <span>de</span>
                    <span className="border-b-2 border-gray-400 min-w-[100px] px-2 py-1 bg-yellow-50 inline-block text-center">
                      {formData.mes}
                    </span>
                    <span>de</span>
                    <span className="border-b-2 border-gray-400 min-w-[60px] px-2 py-1 bg-yellow-50 inline-block text-center">
                      {formData.ano}
                    </span>
                    <span>.</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="text-center">
                    <div className="border-t-2 border-gray-900 pt-2 mt-16">
                      <p className="font-bold text-gray-900">App Group LTDA</p>
                      <p className="text-gray-600 text-sm">CONTRATADA</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-gray-900 pt-2 mt-16">
                      <p className="font-bold text-gray-900">
                        {formData.nomeResponsavel || "Nome do Responsável"}
                      </p>
                      <p className="text-gray-600 text-sm">CONTRATANTE</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Rodapé com contatos */}
              <footer className="mt-12 pt-6 border-t border-gray-200 print:mt-8">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>www.appsindico.com.br</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>contato@appsindico.com.br</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>(81) 99961-8516</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-8 {
            padding: 2rem !important;
          }
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
