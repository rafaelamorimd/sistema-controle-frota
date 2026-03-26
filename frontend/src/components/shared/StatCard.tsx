import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type VarianteIcone = 'primario' | 'alerta' | 'info' | 'sucesso'

const mapIcone: Record<VarianteIcone, { strWrap: string; strIcon: string }> = {
  primario: { strWrap: 'bg-brand-secondary-muted', strIcon: 'text-brand-secondary' },
  alerta: { strWrap: 'bg-red-50', strIcon: 'text-red-600' },
  info: { strWrap: 'bg-blue-50', strIcon: 'text-blue-600' },
  sucesso: { strWrap: 'bg-emerald-50', strIcon: 'text-emerald-600' },
}

interface StatCardProps {
  strTitulo: string
  strValor: string
  objIcone: LucideIcon
  varianteIcone?: VarianteIcone
  children?: ReactNode
}

export default function StatCard({
  strTitulo,
  strValor,
  objIcone: Icon,
  varianteIcone = 'primario',
  children,
}: StatCardProps) {
  const { strWrap, strIcon } = mapIcone[varianteIcone]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">{strTitulo}</p>
          <p className="text-3xl lg:text-4xl font-bold text-brand-primary mt-1 tabular-nums tracking-tight">
            {strValor}
          </p>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${strWrap}`}>
          <Icon size={22} className={strIcon} strokeWidth={2} />
        </div>
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}
