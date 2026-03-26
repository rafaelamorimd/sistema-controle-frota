import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Radio, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { rastreadorService } from '../../services/rastreadorService'
import { veiculoService } from '../../services/veiculoService'

type Evento = {
  id: number
  created_at: string
  tipo_evento: string
  origem_evento: string
  status_comando: string
  detalhes: string
}

export default function RastreadorPage() {
  const queryClient = useQueryClient()
  const [veiculoId, setVeiculoId] = useState('')

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ por_pagina: 500 }),
  })

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['rastreador-eventos', veiculoId],
    queryFn: () => rastreadorService.eventos(Number(veiculoId)),
    enabled: !!veiculoId,
  })

  const syncMutation = useMutation({
    mutationFn: () => rastreadorService.sincronizar(Number(veiculoId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rastreador-eventos', veiculoId] }),
  })

  const veiculos = veiculosData?.data ?? []

  const arrColumns: Column<Evento>[] = [
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="text-brand-secondary" size={28} />
            Rastreador
          </h1>
          <p className="text-gray-500 text-sm">Eventos e sincronizacao (stub/API)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 min-w-[240px]"
        >
          <option value="">Selecione o veículo</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.numero_rastreador ?? 'sem número'}
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
          <div className="p-8 text-center text-gray-500">Selecione um veículo</div>
        ) : (
          <ResponsiveTable
            arrColumns={arrColumns}
            arrData={(eventos ?? []) as Evento[]}
            fnKeyExtractor={(e) => e.id}
            bolLoading={isLoading}
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
  )
}
