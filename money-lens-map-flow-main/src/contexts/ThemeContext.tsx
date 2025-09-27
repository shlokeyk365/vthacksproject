import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ColorScheme {
  name: string;
  primary: string;
  primaryGlow: string;
  primaryDark: string;
  description: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  colorSchemes: ColorScheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColorState] = useState<string>('217 91% 60%');

  // Define available color schemes
  const colorSchemes: ColorScheme[] = [
    {
      name: 'Financial Blue',
      primary: '217 91% 60%',
      primaryGlow: '217 91% 70%',
      primaryDark: '217 91% 45%',
      description: 'Professional blue for financial apps'
    },
    {
      name: 'Success Green',
      primary: '142 71% 45%',
      primaryGlow: '142 71% 55%',
      primaryDark: '142 71% 35%',
      description: 'Growth and success focused'
    },
    {
      name: 'Warning Orange',
      primary: '38 92% 50%',
      primaryGlow: '38 92% 60%',
      primaryDark: '38 92% 40%',
      description: 'Alert and attention focused'
    },
    {
      name: 'Danger Red',
      primary: '0 84% 60%',
      primaryGlow: '0 84% 70%',
      primaryDark: '0 84% 50%',
      description: 'Urgent and critical alerts'
    },
    {
      name: 'Purple Premium',
      primary: '262 83% 58%',
      primaryGlow: '262 83% 68%',
      primaryDark: '262 83% 48%',
      description: 'Premium and luxury feel'
    },
    {
      name: 'Teal Modern',
      primary: '173 80% 40%',
      primaryGlow: '173 80% 50%',
      primaryDark: '173 80% 30%',
      description: 'Modern and clean aesthetic'
    }
  ];

  // Load theme and primary color from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    if (savedPrimaryColor) {
      setPrimaryColorState(savedPrimaryColor);
    }
  }, []);

  // Update resolved theme based on current theme setting
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme and primary color to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(resolvedTheme);
    
    // Apply primary color CSS variables
    const selectedScheme = colorSchemes.find(scheme => scheme.primary === primaryColor) || colorSchemes[0];
    
    root.style.setProperty('--primary', selectedScheme.primary);
    root.style.setProperty('--primary-glow', selectedScheme.primaryGlow);
    root.style.setProperty('--primary-dark', selectedScheme.primaryDark);
    root.style.setProperty('--ring', selectedScheme.primary);
    root.style.setProperty('--sidebar-primary', selectedScheme.primary);
    root.style.setProperty('--sidebar-ring', selectedScheme.primary);
    
    // Update gradients
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${selectedScheme.primary}) 0%, hsl(${selectedScheme.primaryGlow}) 100%)`);
    root.style.setProperty('--gradient-hero', `linear-gradient(135deg, hsl(${selectedScheme.primary}) 0%, hsl(${selectedScheme.primaryDark}) 50%, hsl(${selectedScheme.primaryDark}) 100%)`);
    
    // Update shadows
    root.style.setProperty('--shadow-card', `0 4px 6px -1px hsl(${selectedScheme.primary} / 0.1), 0 2px 4px -1px hsl(${selectedScheme.primary} / 0.06)`);
    root.style.setProperty('--shadow-card-hover', `0 10px 15px -3px hsl(${selectedScheme.primary} / 0.1), 0 4px 6px -2px hsl(${selectedScheme.primary} / 0.05)`);
    root.style.setProperty('--shadow-primary', `0 10px 25px -5px hsl(${selectedScheme.primary} / 0.3)`);
  }, [resolvedTheme, primaryColor, colorSchemes]);

  // Save theme to localStorage
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Save primary color to localStorage
  const handleSetPrimaryColor = (newColor: string) => {
    setPrimaryColorState(newColor);
    localStorage.setItem('primaryColor', newColor);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme, 
      resolvedTheme, 
      primaryColor, 
      setPrimaryColor: handleSetPrimaryColor,
      colorSchemes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
