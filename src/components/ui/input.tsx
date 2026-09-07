import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-12 w-full rounded-xl border border-[#cbdad3] bg-white px-4 text-[#213a35] outline-none transition placeholder:text-[#99aaa4] focus:border-[#579184] focus:ring-4 focus:ring-[#dcece6]', className)} {...props} />
}
