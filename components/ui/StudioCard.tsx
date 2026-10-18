'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'

interface StudioCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  glow?: 'emerald' | 'cyan' | 'amber' | 'violet' | 'none'
  clickable?: boolean
}

const glowColors = {
  emerald: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
  cyan: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
  amber: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
  violet: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
  none: '',
}

export function StudioCard({
  children,
  className,
  glow = 'none',
  clickable = false,
  ...props
}: StudioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'studio-card rounded-2xl',
        clickable && 'cursor-pointer transition-all duration-200',
        glow !== 'none' && glowColors[glow],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
