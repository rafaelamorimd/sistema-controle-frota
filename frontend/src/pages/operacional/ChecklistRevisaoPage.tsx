import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Plus } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { checklistRevisaoService } from '../../services/checklistRevisaoService'
import { veiculoService } from '../../services/veiculoService'

const exemploJson = `{"pneus":"OK","freios":"OK","oleo":"verificar"}`

type ChecklistItem = {
  id: number
  data_revisao: string
  km_revisao: number
  itens_verificados: Record<string, unknown>
}

export default function ChecklistRevisaoPage() {
  const queryClient = useQueryClient()
  const [veiculoId, setVeiculoId] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState({
    data_revisao: new Date().toISOString().slice(0, 10),
    km_revisao: '',
    jsonItens: exemploJson,
  })

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ por_pagina: 500 }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['checklist-revisoes', veiculoId],
    queryFn: () => checklistRevisaoService.listarPorVeiculo(Number(veiculoId), { por_pagina: 50 }),
    enabled: !!veiculoId,
  })

  const criarMutation = useMutation({
    mutationFn: () => {
      let itens: Record<string, unknown>
      try {
        itens = JSON.parse(form.jsonItens) as Record<string, unknown>
      } catch {
        throw new Error('JSON invalido em itens verificados')
      }
      return checklistRevisaoService.criar({
        veiculo_id: Number(veiculoId),
        data_revisao: form.data_revisao,
        km_revisao: Number(form.km_revisao),
        itens_verificados: itens,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-revisoes'] })
      setModalAberto(false)
    },
  })

  const veiculos = veiculosData?.data ?? []
  const lista: ChecklistItem[] = data?.data ?? []

  const arrColumns: Column<ChecklistItem>[] = [
    {
      strLabel: 'Data',
      strKey: 'data',
      render: (c) => <span className="text-gray-700">{c.data_revisao}</span>,
    },
    {
      strLabel: 'Km',
      strKey: 'km',
      render: (c) => <span className="text-gray-700">{c.km_revisao}</span>,
    },
    {
      strLabel: 'Itens (resumo)',
      strKey: 'itens',
      render: (c) => (
        <span className="font-mono text-xs text-gray-600 truncate max-w-md block">
          {JSON.stringify(c.itens_verificados)}
        </span>
      ),
      bolHideMobile: true,
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-brand-secondary" size={28} />
            Checklist de revisão
          </h1>
        </div>
        <button
          type="button"
          disabled={!veiculoId}
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50 text-sm font-medium"
        >
          <Plus size={18} /> Novo registro
        </button>
      </div>

      <div className="flex gap-2 items-center mb-6">
        <label className="text-sm text-gray-600">Veículo</label>
        <select
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[220px]"
        >
          <option value="">Selecione</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.modelo}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!veiculoId ? (
          <div className="p-8 text-center text-gray-500">Escolha um veiculo</div>
        ) : (
          <ResponsiveTable
            arrColumns={arrColumns}
            arrData={lista}
            fnKeyExtractor={(c) => c.id}
            bolLoading={isLoading}
            strEmptyMessage="Nenhum checklist encontrado."
            fnRenderCardHeader={(c) => (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{c.data_revisao}</span>
                <span className="text-sm text-brand-primary font-mono">{c.km_revisao} km</span>
              </div>
            )}
          />
        )}
      </div>

      <Modal aberto={modalAberto} aoFechar={() => setModalAberto(false)} titulo="Novo checklist">
        <div className="space-y-2">
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2"
            value={form.data_revisao}
            onChange={(e) => setForm((f) => ({ ...f, data_revisao: e.target.value }))}
          />
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Km revisão"
            value={form.km_revisao}
            onChange={(e) => setForm((f) => ({ ...f, km_revisao: e.target.value }))}
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2 font-mono text-xs"
            rows={6}
            value={form.jsonItens}
            onChange={(e) => setForm((f) => ({ ...f, jsonItens: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => criarMutation.mutate()}
            className="w-full py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover"
          >
            Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}
