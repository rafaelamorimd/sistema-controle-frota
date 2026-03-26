import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Car, CreditCard, FileText, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import type { Alerta } from '../../types'
import { formatarMesReferencia, formatarMoedaBrl } from '../../utils/format'

const prioridadeCores: Record<string, string> = {
  ALTA: 'border-l-red-500 bg-red-50',
  MEDIA: 'border-l-yellow-500 bg-yellow-50',
  BAIXA: 'border-l-brand-primary bg-brand-primary-muted',
}

export default function DashboardPage() {
  const resumoQuery = useQuery({
    queryKey: ['dashboard', 'resumo'],
    queryFn: () => dashboardService.obterResumo(),
  })

  const rendaQuery = useQuery({
    queryKey: ['dashboard', 'renda-liquida'],
    queryFn: () => dashboardService.obterRendaLiquida(),
  })

  const alertasQuery = useQuery({
    queryKey: ['dashboard', 'alertas'],
    queryFn: () => dashboardService.obterAlertas(5),
  })

  const carregando =
    resumoQuery.isLoading || rendaQuery.isLoading || alertasQuery.isLoading
  const algumErro = resumoQuery.isError || rendaQuery.isError || alertasQuery.isError

  const resumo = resumoQuery.data
  const renda = rendaQuery.data
  const alertas = alertasQuery.data?.itens ?? []

  const cards = resumo
    ? [
        {
          label: 'Veículos (total)',
          value: String(resumo.veiculos_total),
          icon: Car,
          color: 'bg-brand-primary',
        },
        {
          label: 'Veículos alugados',
          value: String(resumo.veiculos_alugados),
          icon: Car,
          color: 'bg-indigo-500',
        },
        {
          label: 'Condutores ativos',
          value: String(resumo.condutores_ativos),
          icon: Users,
          color: 'bg-green-500',
        },
        {
          label: 'Contratos ativos',
          value: String(resumo.contratos_ativos),
          icon: FileText,
          color: 'bg-purple-500',
        },
        {
          label: 'Alertas ativos',
          value: String(resumo.alertas_ativos),
          icon: AlertTriangle,
          color: 'bg-red-500',
        },
      ]
    : []

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {algumErro && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          Não foi possível carregar todos os dados do painel. Verifique se a API está disponível e se os
          endpoints de dashboard estão implementados no backend.
        </div>
      )}

      {carregando ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          Carregando...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {cards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {renda && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Renda líquida mensal</h3>
              <p className="text-sm text-gray-500 mb-4">
                Referência: {formatarMesReferencia(renda.mes_referencia)}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-1">
                    <TrendingUp size={18} /> Receitas pagas
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatarMoedaBrl(renda.receitas_pagas)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
                    <TrendingDown size={18} /> Despesas pagas
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatarMoedaBrl(renda.despesas_pagas)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-brand-primary-muted border border-brand-primary-border">
                  <div className="flex items-center gap-2 text-brand-primary font-medium text-sm mb-1">
                    <CreditCard size={18} /> Líquido
                  </div>
                  <p className="text-2xl font-bold text-brand-primary">
                    {formatarMoedaBrl(renda.renda_liquida)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas recentes</h3>
            {alertas.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum alerta ativo no momento.</p>
            ) : (
              <ul className="space-y-3">
                {alertas.map((a: Alerta) => (
                  <li
                    key={a.id}
                    className={`border border-gray-100 rounded-lg p-4 border-l-4 ${prioridadeCores[a.prioridade] ?? 'border-l-gray-300 bg-gray-50'}`}
                  >
                    <p className="text-sm text-gray-900">{a.mensagem}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      <span>{a.tipo_alerta}</span>
                      <span>•</span>
                      <span>{new Date(a.created_at).toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span>Prioridade {a.prioridade}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
