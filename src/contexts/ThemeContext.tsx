import React, { createContext, useState, useContext, useEffect } from "react";

type AppTheme = "furniture" | "law";

interface ThemeContextType {
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appTheme, setAppTheme] = useState<AppTheme>("furniture");

  useEffect(() => {
    // Apply theme class to document element
    const documentElement = document.documentElement;

    // Remove law-theme class when not needed
    if (appTheme === "furniture") {
      documentElement.classList.remove("law-theme");
    }
    // Add law-theme class when needed
    else if (appTheme === "law") {
      documentElement.classList.add("law-theme");
    }
  }, [appTheme]);

  return (
    <ThemeContext.Provider value={{ appTheme, setAppTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};
