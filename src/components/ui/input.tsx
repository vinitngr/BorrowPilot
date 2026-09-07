import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-[42px] w-full rounded-[5px] border border-[#cfd5dd] bg-white px-3 text-sm text-[#17202b] outline-none transition placeholder:text-[#9ba4af] focus:border-[#2864d7] focus:ring-4 focus:ring-[#eaf1ff]', className)} {...props} />
}
