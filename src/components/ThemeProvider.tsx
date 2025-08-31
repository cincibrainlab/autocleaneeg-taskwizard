import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
  // Update theme-color meta for better mobile URL bar contrast
  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  if (meta) meta.content = isDark ? '#0f172a' : '#1E88E5'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null
      return stored ?? 'system'
    } catch {
      return 'system'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch {}
    applyTheme(theme)

    // Update on system changes when in system mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => theme === 'system' && applyTheme('system')
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme: setThemeState }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
