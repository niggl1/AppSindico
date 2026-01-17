import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  switchable: boolean;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
  enableSystem?: boolean;
}

// Detectar preferência do sistema
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Resolver tema (system -> light/dark)
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = true,
  enableSystem = true,
}: ThemeProviderProps) {
  // Inicializar tema do localStorage ou usar padrão
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    
    const stored = localStorage.getItem("app-sindico-theme") as Theme | null;
    if (stored && (stored === "light" || stored === "dark" || (enableSystem && stored === "system"))) {
      return stored;
    }
    return enableSystem ? "system" : defaultTheme === "system" ? "light" : defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  // Aplicar tema no documento
  const applyTheme = useCallback((resolved: ResolvedTheme) => {
    const root = document.documentElement;
    
    // Adicionar transição suave
    root.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease");
    root.style.transition = "var(--theme-transition)";
    
    if (resolved === "dark") {
      root.classList.add("dark");
      // Atualizar meta theme-color para PWA
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#1a1a2e");
      }
    } else {
      root.classList.remove("dark");
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#ffffff");
      }
    }
    
    // Remover transição após aplicar
    setTimeout(() => {
      root.style.removeProperty("--theme-transition");
      root.style.transition = "";
    }, 300);
  }, []);

  // Efeito para aplicar tema quando muda
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    
    // Salvar no localStorage
    localStorage.setItem("app-sindico-theme", theme);
  }, [theme, applyTheme]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    if (!enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? "dark" : "light";
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, applyTheme]);

  // Função para definir tema
  const setTheme = useCallback((newTheme: Theme) => {
    if (!switchable) return;
    if (!enableSystem && newTheme === "system") {
      newTheme = "light";
    }
    setThemeState(newTheme);
  }, [switchable, enableSystem]);

  // Função para alternar tema (light -> dark -> system -> light)
  const toggleTheme = useCallback(() => {
    if (!switchable) return;
    
    setThemeState(current => {
      if (enableSystem) {
        if (current === "light") return "dark";
        if (current === "dark") return "system";
        return "light";
      } else {
        return current === "light" ? "dark" : "light";
      }
    });
  }, [switchable, enableSystem]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    switchable,
    isSystemTheme: theme === "system",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Componente de seletor de tema
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, switchable } = useTheme();
  
  if (!switchable) return null;
  
  return (
    <div className={`flex items-center gap-1 p-1 bg-muted rounded-lg ${className}`}>
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-colors ${
          theme === "light" ? "bg-background shadow-sm" : "hover:bg-background/50"
        }`}
        title="Tema claro"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-colors ${
          theme === "dark" ? "bg-background shadow-sm" : "hover:bg-background/50"
        }`}
        title="Tema escuro"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-colors ${
          theme === "system" ? "bg-background shadow-sm" : "hover:bg-background/50"
        }`}
        title="Tema do sistema"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}

// Hook para detectar preferência do sistema diretamente
export function useSystemTheme(): ResolvedTheme {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  
  return systemTheme;
}
