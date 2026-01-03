/**
 * React Spectrum Theme Provider
 * Wraps application with Adobe's theme and provider system
 */

import React from 'react';
import { Provider, defaultTheme } from '@adobe/react-spectrum';

export interface ThemeProviderProps {
  children: React.ReactNode;
  colorScheme?: 'light' | 'dark' | 'auto';
  scale?: 'medium' | 'large';
}

/**
 * Theme provider for React Spectrum components
 * 
 * @example
 * ```tsx
 * <ThemeProvider colorScheme="dark">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ 
  children, 
  colorScheme = 'light',
  scale = 'medium' 
}: ThemeProviderProps) {
  return (
    <Provider theme={defaultTheme} colorScheme={colorScheme} scale={scale}>
      {children}
    </Provider>
  );
}
