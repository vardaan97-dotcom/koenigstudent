'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CompanyTheme {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  buttonStyle: 'rounded' | 'pill' | 'square';
  welcomeMessage: string;
  supportEmail: string;
  customBranding: boolean;
}

const defaultTheme: CompanyTheme = {
  id: 'koenig',
  name: 'Koenig Solutions',
  logo: '/koenig-logo.png',
  primaryColor: '#0891b2', // cyan-600
  secondaryColor: '#0e7490', // cyan-700
  accentColor: '#06b6d4', // cyan-500
  headerBg: '#ffffff',
  buttonStyle: 'pill',
  welcomeMessage: 'Welcome to Koenig Learning Portal',
  supportEmail: 'support@koenig.com',
  customBranding: false,
};

const pwcTheme: CompanyTheme = {
  id: 'pwc',
  name: 'PwC',
  logo: '/pwc-logo.png',
  primaryColor: '#e85d04', // PwC Orange
  secondaryColor: '#d00000', // PwC Red
  accentColor: '#ffba08', // PwC Yellow
  headerBg: '#1a1a1a',
  buttonStyle: 'square',
  welcomeMessage: 'Welcome to PwC Learning Academy',
  supportEmail: 'learning@pwc.com',
  customBranding: true,
};

const companyThemes: Record<string, CompanyTheme> = {
  koenig: defaultTheme,
  pwc: pwcTheme,
};

interface ThemeContextType {
  theme: CompanyTheme;
  setCompany: (companyId: string) => void;
  availableThemes: CompanyTheme[];
  isCustomBranded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<CompanyTheme>(pwcTheme); // Default to PWC for demo

  useEffect(() => {
    // Check URL or localStorage for company preference
    const savedCompany = localStorage.getItem('company_theme');
    if (savedCompany && companyThemes[savedCompany]) {
      setTheme(companyThemes[savedCompany]);
    }

    // Apply CSS variables
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  }, [theme]);

  const setCompany = (companyId: string) => {
    if (companyThemes[companyId]) {
      setTheme(companyThemes[companyId]);
      localStorage.setItem('company_theme', companyId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setCompany,
        availableThemes: Object.values(companyThemes),
        isCustomBranded: theme.customBranding,
      }}
    >
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
