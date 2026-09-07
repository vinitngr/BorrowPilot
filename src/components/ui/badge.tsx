import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full bg-[#e6f1eb] px-3 py-1 text-xs font-semibold text-[#2c685d]', className)} {...props} />
}
