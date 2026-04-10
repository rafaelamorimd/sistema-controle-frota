import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Radio, RefreshCw, Route } from 'lucide-react'
import { useMemo, useState } from 'react'
import MapaFrota from '../../components/rastreador/MapaFrota'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { rastreadorService } from '../../services/rastreadorService'
import { veiculoService } from '../../services/veiculoService'
import type { FulltrackAlerta, FulltrackPosicao, RastreadorEvento } from '../../types'

type AbaTipo = 'mapa' | 'alertas' | 'historico' | 'eventos'

function fnNormalizarPlaca(str: string): string {
  return str.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

function fnDatetimeLocalParaTimestamp(strLocal: string): string {
  const d = new Date(strLocal)
  return Number.isNaN(d.getTime()) ? '' : Math.floor(d.getTime() / 1000).toString()
}

export default function RastreadorPage() {
  const queryClient = useQueryClient()
  const [strAba, setStrAba] = useState<AbaTipo>('mapa')
  const [veiculoId, setVeiculoId] = useState('')
  const [strVeiculoMapaId, setStrVeiculoMapaId] = useState('')
  const [strIdVeiculoFiltro, setStrIdVeiculoFiltro] = useState('')
  const [strIgnicaoFiltro, setStrIgnicaoFiltro] = useState<'' | '0' | '1'>('')
  const [strPlacaFoco, setStrPlacaFoco] = useState<string | null>(null)

  const [strInicioAlerta, setStrInicioAlerta] = useState('')
  const [strFimAlerta, setStrFimAlerta] = useState('')
  const [bolPeriodoAlertaAtivo, setBolPeriodoAlertaAtivo] = useState(false)

  const [strVeiculoLocalHist, setStrVeiculoLocalHist] = useState('')
  const [strInicioHist, setStrInicioHist] = useState('')
  const [strFimHist, setStrFimHist] = useState('')

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ por_pagina: 500 }),
  })

  const arrVeiculosLista = veiculosData?.data ?? []

  const posicoesQuery = useQuery({
    queryKey: ['rastreador-posicoes', strIgnicaoFiltro],
    queryFn: () =>
      rastreadorService.posicoes(strIgnicaoFiltro === '' ? undefined : { ignicao: strIgnicaoFiltro }),
    enabled: strAba === 'mapa',
  })

  const veiculosFtQuery = useQuery({
    queryKey: ['rastreador-veiculos-ft'],
    queryFn: () => rastreadorService.veiculosFulltrack(),
    enabled: strAba === 'historico' || strAba === 'mapa',
  })

  const veiculosFt = veiculosFtQuery.data ?? []

  const alertasQuery = useQuery({
    queryKey: ['rastreador-alertas-gps', bolPeriodoAlertaAtivo, strInicioAlerta, strFimAlerta],
    queryFn: async () => {
      if (bolPeriodoAlertaAtivo && strInicioAlerta && strFimAlerta) {
        const ti = fnDatetimeLocalParaTimestamp(strInicioAlerta)
        const tf = fnDatetimeLocalParaTimestamp(strFimAlerta)
        if (!ti || !tf) return []
        return rastreadorService.alertasGpsPeriodo(ti, tf)
      }
      return rastreadorService.alertasGps()
    },
    enabled: strAba === 'alertas',
  })

  const objVeiculoHist = useMemo(
    () => arrVeiculosLista.find((v) => String(v.id) === strVeiculoLocalHist),
    [arrVeiculosLista, strVeiculoLocalHist],
  )

  /** ID no provedor: cadastro (veiculo_id_externo) ou match automatico de placa na lista Fulltrack */
  const strIdHistoricoEfetivo = useMemo((): string => {
    if (!objVeiculoHist) return ''
    const strExt = objVeiculoHist.veiculo_id_externo?.trim()
    if (strExt) return strExt
    const strPlacaN = fnNormalizarPlaca(objVeiculoHist.placa)
    const objFt = veiculosFt.find((v) => fnNormalizarPlaca(v.ras_vei_placa) === strPlacaN)
    return objFt ? String(objFt.ras_vei_id) : ''
  }, [objVeiculoHist, veiculosFt])

  const bolAguardandoListaProvedorHist = Boolean(
    strVeiculoLocalHist &&
      objVeiculoHist &&
      !objVeiculoHist.veiculo_id_externo?.trim() &&
      veiculosFtQuery.isLoading,
  )

  const bolHistoricoSemProvedor = Boolean(
    strVeiculoLocalHist &&
      objVeiculoHist &&
      !veiculosFtQuery.isLoading &&
      !strIdHistoricoEfetivo,
  )

  const historicoQuery = useQuery({
    queryKey: ['rastreador-historico', strIdHistoricoEfetivo, strInicioHist, strFimHist],
    queryFn: () => {
      const ti = fnDatetimeLocalParaTimestamp(strInicioHist)
      const tf = fnDatetimeLocalParaTimestamp(strFimHist)
      if (!strIdHistoricoEfetivo || !ti || !tf) {
        return Promise.resolve([] as FulltrackPosicao[])
      }
      return rastreadorService.historicoPosicoes(strIdHistoricoEfetivo, ti, tf)
    },
    enabled: false,
  })

  const { data: eventos, isLoading: bolLoadingEventos } = useQuery({
    queryKey: ['rastreador-eventos', veiculoId],
    queryFn: () => rastreadorService.eventos(Number(veiculoId)),
    enabled: strAba === 'eventos' && !!veiculoId,
  })

  const syncMutation = useMutation({
    mutationFn: () => rastreadorService.sincronizar(Number(veiculoId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rastreador-eventos', veiculoId] }),
  })

  const arrPosicoesFiltradas = useMemo(() => {
    let arr: FulltrackPosicao[] = posicoesQuery.data ?? []
    if (strIdVeiculoFiltro) {
      arr = arr.filter((p) => p.ras_vei_id === strIdVeiculoFiltro)
    }
    if (strVeiculoMapaId) {
      const objV = arrVeiculosLista.find((v) => String(v.id) === strVeiculoMapaId)
      if (objV) {
        const strN = fnNormalizarPlaca(objV.placa)
        arr = arr.filter((p) => fnNormalizarPlaca(p.ras_vei_placa) === strN)
      }
    }
    return arr
  }, [posicoesQuery.data, strIdVeiculoFiltro, strVeiculoMapaId, arrVeiculosLista])

  const arrTrajetoHistorico = useMemo((): [number, number][] => {
    const arr = historicoQuery.data ?? []
    const arrPontos: [number, number][] = []
    for (const p of arr) {
      const lat = parseFloat(p.ras_eve_latitude)
      const lng = parseFloat(p.ras_eve_longitude)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        arrPontos.push([lat, lng])
      }
    }
    return arrPontos
  }, [historicoQuery.data])

  const veiculos = arrVeiculosLista

  const arrColumnsEventos: Column<RastreadorEvento>[] = [
    {
      strLabel: 'Quando',
      strKey: 'quando',
      render: (e) => <span className="text-gray-700 whitespace-nowrap">{e.created_at}</span>,
    },
    {
      strLabel: 'Tipo',
      strKey: 'tipo',
      render: (e) => <span className="text-gray-700">{e.tipo_evento}</span>,
    },
    {
      strLabel: 'Origem',
      strKey: 'origem',
      render: (e) => <span className="text-gray-700">{e.origem_evento}</span>,
      bolHideMobile: true,
    },
    {
      strLabel: 'Status',
      strKey: 'status',
      render: (e) => <span className="text-gray-700">{e.status_comando}</span>,
    },
    {
      strLabel: 'Detalhes',
      strKey: 'detalhes',
      render: (e) => (
        <span className="text-xs text-gray-600 truncate max-w-md block">{e.detalhes}</span>
      ),
      bolHideMobile: true,
    },
  ]

  const arrColumnsAlertas: Column<FulltrackAlerta>[] = [
    {
      strLabel: 'Data',
      strKey: 'data',
      render: (a) => <span className="text-gray-700 whitespace-nowrap">{a.ras_eal_data_alerta}</span>,
    },
    {
      strLabel: 'Descricao',
      strKey: 'desc',
      render: (a) => <span className="text-gray-800">{a.ras_eal_descricao}</span>,
    },
    {
      strLabel: 'Placa',
      strKey: 'placa',
      render: (a) => <span className="text-gray-600">{a.veiculo_placa ?? '-'}</span>,
    },
    {
      strLabel: 'Local',
      strKey: 'loc',
      render: (a) => (
        <button
          type="button"
          className="text-brand-secondary text-sm font-medium hover:underline"
          onClick={() => {
            const strP = a.veiculo_placa
            setStrPlacaFoco(strP)
            if (strP) {
              const objV = arrVeiculosLista.find(
                (v) => fnNormalizarPlaca(v.placa) === fnNormalizarPlaca(strP),
              )
              if (objV) setStrVeiculoMapaId(String(objV.id))
            }
            setStrAba('mapa')
          }}
        >
          Ver no mapa
        </button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="text-brand-secondary" size={28} />
            Rastreador
          </h1>
          <p className="text-gray-500 text-sm">Mapa, alertas GPS e eventos (driver fulltrack no backend)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        {(
          [
            ['mapa', 'Mapa', MapPin],
            ['alertas', 'Alertas GPS', Radio],
            ['historico', 'Historico', Route],
            ['eventos', 'Eventos locais', RefreshCw],
          ] as const
        ).map(([strId, strLabel, Icon]) => (
          <button
            key={strId}
            type="button"
            onClick={() => setStrAba(strId)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              strAba === strId
                ? 'bg-brand-secondary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon size={18} />
            {strLabel}
          </button>
        ))}
      </div>

      {strAba === 'mapa' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Veiculo (Fulltrack)</label>
              <select
                value={strIdVeiculoFiltro}
                onChange={(e) => setStrIdVeiculoFiltro(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[200px] text-sm"
              >
                <option value="">Todos</option>
                {veiculosFt.map((v) => (
                  <option key={v.ras_vei_id} value={v.ras_vei_id}>
                    {v.ras_vei_placa} — {v.ras_vei_veiculo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ignicao</label>
              <select
                value={strIgnicaoFiltro}
                onChange={(e) => setStrIgnicaoFiltro(e.target.value as '' | '0' | '1')}
                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[140px] text-sm"
              >
                <option value="">Todas</option>
                <option value="1">Ligada</option>
                <option value="0">Desligada</option>
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Veiculo (cadastro)</label>
              <select
                value={strVeiculoMapaId}
                onChange={(e) => {
                  setStrVeiculoMapaId(e.target.value)
                  const objSel = arrVeiculosLista.find((v) => String(v.id) === e.target.value)
                  setStrPlacaFoco(objSel ? objSel.placa : null)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="">Todos</option>
                {arrVeiculosLista.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.modelo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              {posicoesQuery.isLoading ? (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border">
                  Carregando posicoes...
                </div>
              ) : posicoesQuery.isError ? (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
                  Nao foi possivel carregar o mapa. Verifique RASTREADOR_DRIVER=fulltrack e credenciais no
                  backend.
                </div>
              ) : (
                <MapaFrota
                  arrPosicoes={arrPosicoesFiltradas}
                  numAltura={420}
                  strPlacaFoco={strPlacaFoco}
                />
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 max-h-[420px] overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Frota</p>
              <ul className="space-y-2">
                {arrPosicoesFiltradas.map((p) => (
                  <li key={`${p.ras_vei_id}-${p.ras_eve_data_gps}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setStrPlacaFoco(p.ras_vei_placa)
                        const objV = arrVeiculosLista.find(
                          (v) => fnNormalizarPlaca(v.placa) === fnNormalizarPlaca(p.ras_vei_placa),
                        )
                        setStrVeiculoMapaId(objV ? String(objV.id) : '')
                      }}
                      className="w-full text-left text-sm p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    >
                      <span className="font-medium text-gray-900">{p.ras_vei_placa}</span>
                      <span className="block text-xs text-gray-500">{p.ras_eve_data_gps}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {strAba === 'alertas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={bolPeriodoAlertaAtivo}
                onChange={(e) => setBolPeriodoAlertaAtivo(e.target.checked)}
              />
              Filtrar por periodo
            </label>
            {bolPeriodoAlertaAtivo && (
              <>
                <input
                  type="datetime-local"
                  value={strInicioAlerta}
                  onChange={(e) => setStrInicioAlerta(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
                />
                <input
                  type="datetime-local"
                  value={strFimAlerta}
                  onChange={(e) => setStrFimAlerta(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
                />
              </>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <ResponsiveTable
              arrColumns={arrColumnsAlertas}
              arrData={alertasQuery.data ?? []}
              fnKeyExtractor={(a) => a._id}
              bolLoading={alertasQuery.isLoading}
              strEmptyMessage="Nenhum alerta GPS."
            />
          </div>
        </div>
      )}

      {strAba === 'historico' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Veiculo</label>
              <select
                value={strVeiculoLocalHist}
                onChange={(e) => setStrVeiculoLocalHist(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[260px] text-sm"
              >
                <option value="">Selecione</option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.modelo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Inicio</label>
              <input
                type="datetime-local"
                value={strInicioHist}
                onChange={(e) => setStrInicioHist(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fim</label>
              <input
                type="datetime-local"
                value={strFimHist}
                onChange={(e) => setStrFimHist(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                void historicoQuery.refetch()
              }}
              disabled={
                bolAguardandoListaProvedorHist ||
                bolHistoricoSemProvedor ||
                !strIdHistoricoEfetivo ||
                !strInicioHist ||
                !strFimHist
              }
              className="px-4 py-2 bg-brand-secondary text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Carregar trajeto
            </button>
          </div>
          {bolAguardandoListaProvedorHist && (
            <p className="text-sm text-gray-600">Carregando lista do provedor para cruzar pela placa...</p>
          )}
          {bolHistoricoSemProvedor && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Nao foi possivel localizar este veiculo no provedor pela placa. Cadastre o ID em Veiculos (campo ID
              no sistema de rastreamento) ou rode a sincronizacao de vinculos no servidor.
            </p>
          )}
          {historicoQuery.isFetching && <p className="text-sm text-gray-500">Carregando...</p>}
          {historicoQuery.data && historicoQuery.data.length > 0 && (
            <MapaFrota
              arrPosicoes={historicoQuery.data}
              arrTrajeto={arrTrajetoHistorico}
              numAltura={480}
            />
          )}
          {historicoQuery.isFetched && historicoQuery.data?.length === 0 && !historicoQuery.isFetching && (
            <p className="text-sm text-gray-500">Nenhum ponto no periodo.</p>
          )}
        </div>
      )}

      {strAba === 'eventos' && (
        <div>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <select
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 min-w-[240px]"
            >
              <option value="">Selecione o veiculo</option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.numero_rastreador ?? 'sem numero'}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!veiculoId || syncMutation.isPending}
              onClick={() => syncMutation.mutate()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50 text-sm font-medium"
            >
              <RefreshCw size={18} className={syncMutation.isPending ? 'animate-spin' : ''} />
              Sincronizar
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {!veiculoId ? (
              <div className="p-8 text-center text-gray-500">Selecione um veiculo</div>
            ) : (
              <ResponsiveTable
                arrColumns={arrColumnsEventos}
                arrData={(eventos ?? []) as RastreadorEvento[]}
                fnKeyExtractor={(e) => e.id}
                bolLoading={bolLoadingEventos}
                strEmptyMessage="Nenhum evento encontrado."
                fnRenderCardHeader={(e) => (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{e.tipo_evento}</span>
                    <span className="text-xs text-gray-500">{e.created_at}</span>
                  </div>
                )}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
