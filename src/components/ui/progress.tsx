import { cn } from '../../lib/utils'

export function Progress({ value, className }: { value: number; className?: string }) {
  return <div className={cn('h-1 overflow-hidden bg-[#dfe4ea]', className)}><div className="h-full bg-[#2864d7] transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
}
