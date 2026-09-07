import { cn } from '../../lib/utils'

export function Progress({ value, className }: { value: number; className?: string }) {
  return <div className={cn('h-2 overflow-hidden rounded-full bg-[#e1ebe5]', className)}><div className="h-full rounded-full bg-[#4b8c7e] transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
}
