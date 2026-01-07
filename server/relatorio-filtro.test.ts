import { describe, it, expect } from "vitest";

// Função de filtragem por protocolo (mesma lógica do frontend)
function filtrarPorProtocolo<T extends { protocolo?: string | null }>(
  items: T[],
  filtroProtocolo: string
): T[] {
  if (!filtroProtocolo.trim()) return items;
  const filtros = filtroProtocolo.split(",").map(f => f.trim().toLowerCase()).filter(f => f);
  if (filtros.length === 0) return items;
  return items.filter(item => {
    if (!item.protocolo) return false;
    const protocoloLower = item.protocolo.toLowerCase();
    return filtros.some(filtro => protocoloLower.includes(filtro));
  });
}

describe("Filtro por Protocolo no Relatório", () => {
  const dadosTeste = [
    { id: 1, titulo: "Manutenção 1", protocolo: "MAN-2024-001" },
    { id: 2, titulo: "Manutenção 2", protocolo: "MAN-2024-002" },
    { id: 3, titulo: "Vistoria 1", protocolo: "VIS-2024-001" },
    { id: 4, titulo: "Ocorrência 1", protocolo: "OCO-2024-001" },
    { id: 5, titulo: "Checklist 1", protocolo: "CHK-2024-001" },
    { id: 6, titulo: "Item sem protocolo", protocolo: null },
    { id: 7, titulo: "Manutenção 3", protocolo: "MAN-2024-003" },
  ];

  it("deve retornar todos os itens quando filtro está vazio", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "");
    expect(resultado).toHaveLength(7);
  });

  it("deve retornar todos os itens quando filtro contém apenas espaços", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "   ");
    expect(resultado).toHaveLength(7);
  });

  it("deve filtrar por protocolo exato", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "MAN-2024-001");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].protocolo).toBe("MAN-2024-001");
  });

  it("deve filtrar por protocolo parcial (case insensitive)", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "man-2024");
    expect(resultado).toHaveLength(3);
    expect(resultado.every(item => item.protocolo?.startsWith("MAN-2024"))).toBe(true);
  });

  it("deve filtrar por múltiplos protocolos separados por vírgula", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "MAN-2024-001, VIS-2024-001");
    expect(resultado).toHaveLength(2);
    expect(resultado.map(item => item.protocolo)).toContain("MAN-2024-001");
    expect(resultado.map(item => item.protocolo)).toContain("VIS-2024-001");
  });

  it("deve filtrar por prefixo de tipo", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "MAN");
    expect(resultado).toHaveLength(3);
    expect(resultado.every(item => item.protocolo?.startsWith("MAN"))).toBe(true);
  });

  it("deve excluir itens sem protocolo", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "2024");
    expect(resultado).toHaveLength(6);
    expect(resultado.every(item => item.protocolo !== null)).toBe(true);
  });

  it("deve retornar array vazio quando nenhum protocolo corresponde", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "XYZ-9999");
    expect(resultado).toHaveLength(0);
  });

  it("deve ignorar espaços extras nos filtros", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "  MAN-2024-001  ,  VIS-2024-001  ");
    expect(resultado).toHaveLength(2);
  });

  it("deve ser case insensitive", () => {
    const resultado1 = filtrarPorProtocolo(dadosTeste, "man-2024-001");
    const resultado2 = filtrarPorProtocolo(dadosTeste, "MAN-2024-001");
    const resultado3 = filtrarPorProtocolo(dadosTeste, "Man-2024-001");
    
    expect(resultado1).toHaveLength(1);
    expect(resultado2).toHaveLength(1);
    expect(resultado3).toHaveLength(1);
    expect(resultado1[0].id).toBe(resultado2[0].id);
    expect(resultado2[0].id).toBe(resultado3[0].id);
  });

  it("deve filtrar por ano", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "2024");
    expect(resultado).toHaveLength(6);
  });

  it("deve filtrar diferentes tipos de itens", () => {
    const resultado = filtrarPorProtocolo(dadosTeste, "OCO, CHK");
    expect(resultado).toHaveLength(2);
    expect(resultado.map(item => item.protocolo)).toContain("OCO-2024-001");
    expect(resultado.map(item => item.protocolo)).toContain("CHK-2024-001");
  });
});
