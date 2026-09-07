import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center border border-[#cbd9f5] bg-[#eaf1ff] px-2 py-1 text-[10px] font-semibold text-[#1c438d]', className)} {...props} />
}
