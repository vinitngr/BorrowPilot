import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const { type = 'button', ...buttonProps } = props
  return <button className={cn(
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-[5px] px-4 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2864d7] disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary' && 'bg-[#2864d7] text-white shadow-sm hover:bg-[#16479f]',
    variant === 'secondary' && 'border border-[#cbd9f5] bg-white text-[#1c438d] hover:bg-[#eaf1ff]',
    variant === 'ghost' && 'text-[#6e7885] hover:bg-[#edf0f4]',
    className,
  )} type={type} {...buttonProps} />
}
