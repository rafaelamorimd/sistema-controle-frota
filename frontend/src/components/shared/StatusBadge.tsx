import type { ReactNode } from 'react'

export type StatusBadgeVariante = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const mapVariante: Record<StatusBadgeVariante, string> = {
  success: 'bg-emerald-50 text-emerald-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
}

interface StatusBadgeProps {
  strTexto: string
  variante?: StatusBadgeVariante
  nodeIcone?: ReactNode
  bolCompacto?: boolean
}

export default function StatusBadge({
  strTexto,
  variante = 'neutral',
  nodeIcone,
  bolCompacto = true,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${
        bolCompacto ? 'text-[10px] px-2 py-0.5 uppercase tracking-wide' : 'text-xs px-2.5 py-1'
      } ${mapVariante[variante]}`}
    >
      {nodeIcone}
      {strTexto}
    </span>
  )
}
