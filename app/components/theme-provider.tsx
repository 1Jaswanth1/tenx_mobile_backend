/**
 * Theme Provider Component for 10xR Community Platform
 *
 * Wraps the application with next-themes ThemeProvider to enable
 * theme switching (light, dark, system) with persistence.
 *
 * Features:
 * - Automatic system theme detection
 * - Local storage persistence
 * - No flash of unstyled content (FOUC)
 * - Hydration-safe implementation
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Theme Provider Wrapper
 *
 * Configures next-themes with:
 * - attribute="class" - Themes applied via CSS class on <html> element
 * - defaultTheme="system" - Uses system preference by default
 * - enableSystem={true} - Enables system theme detection
 *
 * @param children - Child components to wrap
 * @param props - Additional ThemeProvider props
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
