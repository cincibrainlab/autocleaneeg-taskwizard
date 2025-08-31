import React from 'react'
import { Moon, Monitor, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/design-system'
import { useTheme, type Theme } from './ThemeProvider'

type Props = {
  className?: string
  variant?: 'default' | 'inverted'
}

export default function ThemeToggle({ className, variant = 'default' }: Props) {
  const { theme, setTheme } = useTheme()

  const baseBtn = 'px-2 py-1 h-8 w-8'
  const isInverted = variant === 'inverted'
  const invertClasses = isInverted
    ? 'bg-white/15 border-white/30 text-white hover:bg-white/25'
    : undefined

  const item = (key: Theme, Icon: React.ComponentType<any>, label: string) => (
    <Button
      key={key}
      type="button"
      variant={theme === key ? 'default' : 'outline'}
      size="icon"
      role="radio"
      aria-checked={theme === key}
      title={label}
      onClick={() => setTheme(key)}
      className={cn(baseBtn, invertClasses)}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  )

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-md', className)} role="radiogroup" aria-label="Theme">
      {item('light', Sun, 'Light')}
      {item('system', Monitor, 'System')}
      {item('dark', Moon, 'Dark')}
    </div>
  )
}

