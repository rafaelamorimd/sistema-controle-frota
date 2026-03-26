import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Radio, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { rastreadorService } from '../../services/rastreadorService'
import { veiculoService } from '../../services/veiculoService'

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Radio className="text-brand-secondary" size={28} />
          Rastreador
        </h1>
        <p className="text-gray-500 text-sm">Eventos e sincronizacao (stub/API)</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          className="border rounded-lg px-3 py-2 min-w-[240px]"
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50"
        >
          <RefreshCw size={18} className={syncMutation.isPending ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Detalhes</th>
              </tr>
            </thead>
          <tbody>
            {!veiculoId ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Selecione um veiculo
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : (
              (eventos ?? []).map((e) => (
                <tr key={e.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 whitespace-nowrap">{e.created_at}</td>
                  <td className="px-4 py-3">{e.tipo_evento}</td>
                  <td className="px-4 py-3">{e.origem_evento}</td>
                  <td className="px-4 py-3">{e.status_comando}</td>
                  <td className="px-4 py-3 max-w-md truncate text-xs text-gray-600">{e.detalhes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
