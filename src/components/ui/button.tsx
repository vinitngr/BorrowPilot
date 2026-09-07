import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return <button className={cn(
    'inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27665c] disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary' && 'bg-[#1f5148] text-white shadow-sm hover:bg-[#173e37]',
    variant === 'secondary' && 'border border-[#c8d5cf] bg-white text-[#1f5148] hover:bg-[#eef4f0]',
    variant === 'ghost' && 'text-[#55716a] hover:bg-[#e7efea]',
    className,
  )} {...props} />
}
