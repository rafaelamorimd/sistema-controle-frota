import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Car,
  Clock,
  Download,
  FileText,
  Gauge,
  Radio,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import MapaFrota from '../../components/rastreador/MapaFrota'
import { dashboardService } from '../../services/dashboardService'
import type { Alerta } from '../../types'
import { formatarMesReferencia, formatarMoedaBrl } from '../../utils/format'
import { useAuthStore } from '../../stores/authStore'
import StatCard from '../../components/shared/StatCard'
import StatusBadge, { type StatusBadgeVariante } from '../../components/shared/StatusBadge'

function mapPrioridadeParaBadge(strPrioridade: string): StatusBadgeVariante {
  if (strPrioridade === 'ALTA') return 'danger'
  if (strPrioridade === 'MEDIA') return 'warning'
  if (strPrioridade === 'BAIXA') return 'info'
  return 'neutral'
}

/** Barras do grafico (valores relativos para visual tipo referencia) */
function GraficoAtividadeBarra({ arrValores }: { arrValores: number[] }) {
  const numMax = Math.max(...arrValores, 1)
  const arrHoras = ['08', '10', '12', '14', '16', '18', '20']
  return (
    <div className="flex items-end justify-between gap-1 sm:gap-2 h-40 pt-2 border-t border-gray-100">
      {arrValores.map((numV, numI) => {
        const numAlturaPx = Math.max(6, Math.round((numV / numMax) * 120))
        return (
          <div key={arrHoras[numI]} className="flex flex-col items-center flex-1 min-w-0 h-40 justify-end gap-2">
            <div
              className="w-full max-w-[32px] mx-auto rounded-t-lg bg-linear-to-t from-brand-secondary to-emerald-400 min-h-[6px]"
              style={{ height: numAlturaPx }}
              title={`${arrHoras[numI]}h`}
            />
            <span className="text-[10px] text-gray-400 font-medium">{arrHoras[numI]}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [bolPeriodoHoje, setBolPeriodoHoje] = useState(true)

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
    queryFn: () => dashboardService.obterAlertas(8),
  })

  const carregando =
    resumoQuery.isLoading || rendaQuery.isLoading || alertasQuery.isLoading
  const algumErro = resumoQuery.isError || rendaQuery.isError || alertasQuery.isError

  const resumo = resumoQuery.data
  const renda = rendaQuery.data
  const alertas = alertasQuery.data?.itens ?? []

  const numEmUso = resumo?.veiculos_alugados ?? 0
  const numDisponiveis = Math.max(0, (resumo?.veiculos_total ?? 0) - numEmUso)
  const pctEmUso = resumo?.veiculos_total ? Math.round((numEmUso / resumo.veiculos_total) * 100) : 0
  const pctDisponivel = resumo?.veiculos_total
    ? Math.round((numDisponiveis / resumo.veiculos_total) * 100)
    : 0

  const arrBarras = useMemo(() => {
    const base = resumo?.veiculos_total ?? 10
    return [0.35, 0.55, 0.45, 0.7, 0.5, 0.85, 0.6].map((numF) =>
      Math.round(base * numF * (bolPeriodoHoje ? 0.12 : 1)),
    )
  }, [resumo?.veiculos_total, bolPeriodoHoje])

  const strSaudacao =
    new Date().getHours() < 12
      ? 'Bom dia'
      : new Date().getHours() < 18
        ? 'Boa tarde'
        : 'Boa noite'

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {strSaudacao}
            {user?.name ? `, ${user.name.split(' ')[0]}` : ''} — visao geral da sua frota em tempo real.
          </p>
        </div>
        <Link
          to="/relatorios"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-surface-muted transition-colors shrink-0"
        >
          <Download size={18} className="text-brand-secondary" />
          Exportar visao
        </Link>
      </div>

      {algumErro && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          Não foi possível carregar todos os dados do painel. Verifique se a API está disponível.
        </div>
      )}

      {carregando ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
          Carregando...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              strTitulo="Total de veículos"
              strValor={resumo?.veiculos_total?.toLocaleString('pt-BR') ?? '0'}
              objIcone={Car}
              varianteIcone="primario"
            >
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-brand-secondary bg-brand-secondary-muted/90 px-2.5 py-1 rounded-full w-fit">
                <TrendingUp size={14} strokeWidth={2.5} /> Frota cadastrada
              </div>
            </StatCard>

            <StatCard
              strTitulo="Alertas ativos"
              strValor={resumo?.alertas_ativos?.toLocaleString('pt-BR') ?? '0'}
              objIcone={AlertTriangle}
              varianteIcone="alerta"
            >
              <p className="text-xs text-gray-400">Requer atencao quando maior que zero</p>
            </StatCard>

            <StatCard
              strTitulo="Contratos ativos"
              strValor={resumo?.contratos_ativos?.toLocaleString('pt-BR') ?? '0'}
              objIcone={Clock}
              varianteIcone="info"
            >
              <p className="text-xs text-gray-400">Locacoes em vigor</p>
            </StatCard>

            <StatCard
              strTitulo="Condutores ativos"
              strValor={resumo?.condutores_ativos?.toLocaleString('pt-BR') ?? '0'}
              objIcone={Users}
              varianteIcone="sucesso"
            >
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                <Gauge size={14} strokeWidth={2} /> Operacao
              </div>
            </StatCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Status da frota + grafico */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-brand-primary">Distribuicao da frota</h2>
                  <div className="flex rounded-xl bg-gray-100 p-1 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setBolPeriodoHoje(false)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        !bolPeriodoHoje ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      Semanal
                    </button>
                    <button
                      type="button"
                      onClick={() => setBolPeriodoHoje(true)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        bolPeriodoHoje ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      Hoje
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Radio size={18} className="text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">{pctEmUso}%</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-primary tabular-nums">{numEmUso}</p>
                    <p className="text-xs text-gray-500 mt-1">Em uso</p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Car size={18} className="text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">{pctDisponivel}%</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-primary tabular-nums">{numDisponiveis}</p>
                    <p className="text-xs text-gray-500 mt-1">Disponiveis</p>
                  </div>
                  <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users size={18} className="text-violet-600" />
                      <span className="text-xs font-semibold text-violet-800">ativos</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-primary tabular-nums">
                      {resumo?.condutores_ativos?.toLocaleString('pt-BR') ?? '0'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Condutores</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Atividade (indicativo)
                  </p>
                  <GraficoAtividadeBarra arrValores={arrBarras} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-brand-primary">Rastreamento GPS</h3>
                  <Link
                    to="/rastreador"
                    className="text-sm font-semibold text-brand-secondary hover:text-brand-secondary-hover"
                  >
                    Ver detalhes
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                    <p className="text-xs text-gray-500">Com sinal / frota</p>
                    <p className="text-xl font-bold text-brand-primary tabular-nums">
                      {resumo?.rastreador_total_gps?.toLocaleString('pt-BR') ?? '0'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
                    <p className="text-xs text-gray-500">Ignicao ligada</p>
                    <p className="text-xl font-bold text-brand-primary tabular-nums">
                      {resumo?.rastreador_ignicao_ligada?.toLocaleString('pt-BR') ?? '0'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Alertas GPS abertos</p>
                    <p className="text-xl font-bold text-brand-primary tabular-nums">
                      {resumo?.rastreador_alertas_gps?.toLocaleString('pt-BR') ?? '0'}
                    </p>
                  </div>
                </div>
                {resumo?.rastreador_posicoes && resumo.rastreador_posicoes.length > 0 ? (
                  <MapaFrota arrPosicoes={resumo.rastreador_posicoes} numAltura={200} bolMiniMapa />
                ) : (
                  <p className="text-sm text-gray-500">
                    Configure <code className="text-xs bg-gray-100 px-1 rounded">RASTREADOR_DRIVER=fulltrack</code> e
                    credenciais Fulltrack no backend para exibir o mapa.
                  </p>
                )}
              </div>

              {renda && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
                  <h3 className="text-lg font-semibold text-brand-primary mb-1">Renda liquida mensal</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Referencia: {formatarMesReferencia(renda.mes_referencia)}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-medium text-green-700 mb-1">Receitas pagas</p>
                      <p className="text-xl font-bold text-gray-900 tabular-nums">
                        {formatarMoedaBrl(renda.receitas_pagas)}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-medium text-red-700 mb-1">Despesas pagas</p>
                      <p className="text-xl font-bold text-gray-900 tabular-nums">
                        {formatarMoedaBrl(renda.despesas_pagas)}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-brand-primary-muted border border-brand-primary-border">
                      <p className="text-xs font-medium text-brand-primary mb-1">Liquido</p>
                      <p className="text-2xl font-bold text-brand-primary tabular-nums">
                        {formatarMoedaBrl(renda.renda_liquida)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista tipo maintenance / alertas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 flex flex-col min-h-[320px]">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold text-brand-primary">Alertas recentes</h2>
                <Link
                  to="/relatorios"
                  className="text-xs font-semibold text-brand-secondary hover:text-brand-secondary-hover uppercase tracking-wide"
                >
                  Ver tudo
                </Link>
              </div>
              {alertas.length === 0 ? (
                <p className="text-gray-500 text-sm flex-1">Nenhum alerta ativo no momento.</p>
              ) : (
                <ul className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-1">
                  {alertas.map((a: Alerta) => (
                    <li
                      key={a.id}
                      className="rounded-xl border border-gray-100 p-3 hover:bg-surface-muted/80 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-800 leading-snug">{a.mensagem}</p>
                        <StatusBadge
                          strTexto={a.prioridade}
                          variante={mapPrioridadeParaBadge(a.prioridade)}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">
                        {new Date(a.created_at).toLocaleString('pt-BR')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/operacional/manutencoes"
                className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-secondary"
              >
                <Wrench size={18} />
                Ir para manutenções
              </Link>
            </div>
          </div>

          {/* Banner inferior — referência */}
          <div className="rounded-2xl bg-brand-primary text-white p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-lg">
            <div className="max-w-2xl">
              <h3 className="text-xl lg:text-2xl font-bold">Excelência operacional</h3>
              <p className="text-white/85 text-sm mt-2 leading-relaxed">
                Acompanhe indicadores, alertas e contratos em um só lugar. Gere relatórios para sua equipe e
                mantenha a frota sempre em conformidade.
              </p>
            </div>
            <Link
              to="/relatorios"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-secondary text-white font-semibold shadow-md hover:bg-brand-secondary-hover transition-colors shrink-0"
            >
              <FileText size={20} />
              Baixar relatorio
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
