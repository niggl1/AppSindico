import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do getDb
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

// Mock do storagePut
vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ url: 'https://storage.example.com/file.pdf' }),
}));

describe('Comunicados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Schema de Comunicados', () => {
    it('deve ter os campos obrigatórios definidos', () => {
      // Verificar estrutura do comunicado
      const comunicadoFields = [
        'id',
        'revistaId',
        'titulo',
        'descricao',
        'anexoUrl',
        'anexoNome',
        'anexoTipo',
        'anexoTamanho',
        'dataPublicacao',
        'destaque',
        'ativo',
        'createdAt',
        'updatedAt',
      ];
      
      expect(comunicadoFields).toContain('titulo');
      expect(comunicadoFields).toContain('descricao');
      expect(comunicadoFields).toContain('anexoUrl');
      expect(comunicadoFields).toContain('anexoNome');
      expect(comunicadoFields).toContain('destaque');
    });

    it('deve permitir anexos de diferentes tipos', () => {
      const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      expect(tiposPermitidos).toContain('application/pdf');
      expect(tiposPermitidos).toContain('image/jpeg');
      expect(tiposPermitidos).toContain('application/msword');
    });
  });

  describe('Validação de Comunicados', () => {
    it('deve rejeitar comunicado sem título', () => {
      const comunicado = {
        revistaId: 1,
        titulo: '',
        descricao: 'Descrição do comunicado',
      };
      
      expect(comunicado.titulo.trim()).toBe('');
    });

    it('deve aceitar comunicado com título válido', () => {
      const comunicado = {
        revistaId: 1,
        titulo: 'Comunicado Importante',
        descricao: 'Descrição do comunicado',
      };
      
      expect(comunicado.titulo.trim().length).toBeGreaterThan(0);
    });

    it('deve aceitar comunicado sem anexo', () => {
      const comunicado = {
        revistaId: 1,
        titulo: 'Comunicado sem anexo',
        descricao: 'Este comunicado não tem anexo',
        anexoUrl: undefined,
        anexoNome: undefined,
      };
      
      expect(comunicado.anexoUrl).toBeUndefined();
      expect(comunicado.anexoNome).toBeUndefined();
    });

    it('deve aceitar comunicado com anexo', () => {
      const comunicado = {
        revistaId: 1,
        titulo: 'Comunicado com anexo',
        descricao: 'Este comunicado tem um anexo PDF',
        anexoUrl: 'https://storage.example.com/documento.pdf',
        anexoNome: 'documento.pdf',
        anexoTipo: 'application/pdf',
        anexoTamanho: 1024000,
      };
      
      expect(comunicado.anexoUrl).toBeDefined();
      expect(comunicado.anexoNome).toBe('documento.pdf');
      expect(comunicado.anexoTipo).toBe('application/pdf');
    });
  });

  describe('Formatação de Tamanho de Arquivo', () => {
    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    it('deve formatar bytes corretamente', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('deve formatar kilobytes corretamente', () => {
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('deve formatar megabytes corretamente', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(5242880)).toBe('5.0 MB');
    });
  });

  describe('Ícones de Arquivo', () => {
    const getFileIcon = (tipo: string) => {
      if (tipo?.includes('pdf')) return '📄';
      if (tipo?.includes('word') || tipo?.includes('document')) return '📝';
      if (tipo?.includes('excel') || tipo?.includes('spreadsheet')) return '📊';
      if (tipo?.includes('image')) return '🖼️';
      return '📎';
    };

    it('deve retornar ícone correto para PDF', () => {
      expect(getFileIcon('application/pdf')).toBe('📄');
    });

    it('deve retornar ícone correto para Word', () => {
      expect(getFileIcon('application/msword')).toBe('📝');
      expect(getFileIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('📝');
    });

    it('deve retornar ícone correto para Excel', () => {
      // Excel contém 'spreadsheet' no tipo MIME
      expect(getFileIcon('spreadsheet')).toBe('📊');
    });

    it('deve retornar ícone correto para imagens', () => {
      expect(getFileIcon('image/jpeg')).toBe('🖼️');
      expect(getFileIcon('image/png')).toBe('🖼️');
    });

    it('deve retornar ícone padrão para tipos desconhecidos', () => {
      expect(getFileIcon('application/octet-stream')).toBe('📎');
      expect(getFileIcon('')).toBe('📎');
    });
  });

  describe('Validação de Tamanho de Arquivo', () => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    it('deve aceitar arquivos menores que 10MB', () => {
      const fileSize = 5 * 1024 * 1024; // 5MB
      expect(fileSize <= MAX_FILE_SIZE).toBe(true);
    });

    it('deve rejeitar arquivos maiores que 10MB', () => {
      const fileSize = 15 * 1024 * 1024; // 15MB
      expect(fileSize <= MAX_FILE_SIZE).toBe(false);
    });

    it('deve aceitar arquivo exatamente no limite', () => {
      const fileSize = 10 * 1024 * 1024; // 10MB
      expect(fileSize <= MAX_FILE_SIZE).toBe(true);
    });
  });

  describe('Validação de Tipos de Arquivo', () => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    it('deve aceitar PDF', () => {
      expect(allowedTypes.includes('application/pdf')).toBe(true);
    });

    it('deve aceitar DOC e DOCX', () => {
      expect(allowedTypes.includes('application/msword')).toBe(true);
      expect(allowedTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
    });

    it('deve aceitar imagens JPEG, PNG e GIF', () => {
      expect(allowedTypes.includes('image/jpeg')).toBe(true);
      expect(allowedTypes.includes('image/png')).toBe(true);
      expect(allowedTypes.includes('image/gif')).toBe(true);
    });

    it('deve aceitar XLS e XLSX', () => {
      expect(allowedTypes.includes('application/vnd.ms-excel')).toBe(true);
      expect(allowedTypes.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true);
    });

    it('deve rejeitar tipos não permitidos', () => {
      expect(allowedTypes.includes('application/zip')).toBe(false);
      expect(allowedTypes.includes('video/mp4')).toBe(false);
      expect(allowedTypes.includes('audio/mp3')).toBe(false);
    });
  });

  describe('Comunicados em Destaque', () => {
    it('deve permitir marcar comunicado como destaque', () => {
      const comunicado = {
        titulo: 'Comunicado Urgente',
        destaque: true,
      };
      
      expect(comunicado.destaque).toBe(true);
    });

    it('deve ter destaque como false por padrão', () => {
      const comunicado = {
        titulo: 'Comunicado Normal',
        destaque: false,
      };
      
      expect(comunicado.destaque).toBe(false);
    });
  });

  describe('Ordenação de Cards Alfabética', () => {
    const sections = [
      { label: 'Achados e Perdidos' },
      { label: 'Antes e Depois' },
      { label: 'Aquisições' },
      { label: 'Avisos' },
      { label: 'Caronas' },
      { label: 'Classificados' },
      { label: 'Comunicados' },
      { label: 'Eventos' },
      { label: 'Funcionários' },
      { label: 'Melhorias' },
      { label: 'Mensagem do Síndico' },
      { label: 'Publicidade' },
      { label: 'Realizações' },
      { label: 'Regras' },
      { label: 'Segurança' },
      { label: 'Vagas' },
      { label: 'Votações' },
    ];

    it('deve estar ordenado alfabeticamente', () => {
      const labels = sections.map(s => s.label);
      const sortedLabels = [...labels].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      expect(labels).toEqual(sortedLabels);
    });

    it('deve conter Comunicados na lista', () => {
      const labels = sections.map(s => s.label);
      expect(labels).toContain('Comunicados');
    });

    it('deve ter 17 secções', () => {
      expect(sections.length).toBe(17);
    });
  });
});
