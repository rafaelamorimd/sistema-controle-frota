import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Plus, Wrench } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { manutencaoService } from '../../services/manutencaoService'
import { veiculoService } from '../../services/veiculoService'
import type { Manutencao } from '../../types'
import { formatarMoedaBrl } from '../../utils/format'

const statusCores: Record<string, string> = {
  CONCLUIDA: 'bg-green-100 text-green-800',
  EM_ANDAMENTO: 'bg-amber-100 text-amber-800',
}

export default function ManutencoesPage() {
  const queryClient = useQueryClient()
  const [veiculoFiltro, setVeiculoFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<{
    veiculo_id: string
    tipo: 'PREVENTIVA' | 'CORRETIVA'
    descricao: string
    data_entrada: string
    km_entrada: string
    local: string
  }>({
    veiculo_id: '',
    tipo: 'PREVENTIVA',
    descricao: '',
    data_entrada: new Date().toISOString().slice(0, 10),
    km_entrada: '',
    local: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['manutencoes', veiculoFiltro],
    queryFn: () =>
      manutencaoService.listar({
        veiculo_id: veiculoFiltro || undefined,
        por_pagina: 50,
      }),
  })

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ por_pagina: 500 }),
  })

  const criarMutation = useMutation({
    mutationFn: () =>
      manutencaoService.criar({
        veiculo_id: Number(form.veiculo_id),
        tipo: form.tipo,
        descricao: form.descricao,
        data_entrada: form.data_entrada,
        km_entrada: Number(form.km_entrada),
        local: form.local || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] })
      setModalAberto(false)
    },
  })

  const concluirMutation = useMutation({
    mutationFn: (m: Manutencao) => manutencaoService.concluir(m.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manutencoes'] }),
  })

  const lista = data?.data ?? []
  const veiculos = veiculosData?.data ?? []

  const arrColumns: Column<Manutencao>[] = [
    {
      strLabel: 'Veiculo',
      strKey: 'veiculo',
      render: (m) => <span className="text-gray-700">{m.veiculo?.placa ?? m.veiculo_id}</span>,
    },
    {
      strLabel: 'Tipo',
      strKey: 'tipo',
      render: (m) => <span className="text-gray-700">{m.tipo}</span>,
    },
    {
      strLabel: 'Entrada',
      strKey: 'entrada',
      render: (m) => <span className="text-gray-700">{m.data_entrada}</span>,
    },
    {
      strLabel: 'Status',
      strKey: 'status',
      render: (m) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusCores[m.status] ?? ''}`}>
          {m.status}
        </span>
      ),
    },
    {
      strLabel: 'Custo',
      strKey: 'custo',
      render: (m) => <span className="text-gray-700">{formatarMoedaBrl(Number(m.custo_total))}</span>,
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="text-brand-secondary" size={28} />
            Manutencoes
          </h1>
          <p className="text-gray-500 text-sm">Ordens de servico e revisoes</p>
        </div>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover text-sm font-medium"
        >
          <Plus size={18} /> Nova
        </button>
      </div>

      <div className="flex gap-2 items-center mb-6">
        <label className="text-sm text-gray-600">Veiculo</label>
        <select
          value={veiculoFiltro}
          onChange={(e) => setVeiculoFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.modelo}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ResponsiveTable
          arrColumns={arrColumns}
          arrData={lista}
          fnKeyExtractor={(m) => m.id}
          bolLoading={isLoading}
          strEmptyMessage="Nenhuma manutencao encontrada."
          fnRenderCardHeader={(m) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{m.veiculo?.placa ?? m.veiculo_id}</p>
                <p className="text-xs text-gray-500">{m.tipo} - {m.data_entrada}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusCores[m.status] ?? ''}`}>
                {m.status}
              </span>
            </div>
          )}
          fnRenderActions={(m) =>
            m.status === 'EM_ANDAMENTO' ? (
              <button
                type="button"
                onClick={() => concluirMutation.mutate(m)}
                className="text-green-600 hover:underline inline-flex items-center gap-1 text-sm"
              >
                <CheckCircle size={16} /> Concluir
              </button>
            ) : null
          }
        />
      </div>

      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo="Nova manutencao"
      >
        <div className="space-y-3">
          <select
            required
            value={form.veiculo_id}
            onChange={(e) => setForm((f) => ({ ...f, veiculo_id: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Selecione o veiculo</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa}
              </option>
            ))}
          </select>
          <select
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as 'PREVENTIVA' | 'CORRETIVA' }))}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="PREVENTIVA">Preventiva</option>
            <option value="CORRETIVA">Corretiva</option>
          </select>
          <textarea
            placeholder="Descricao"
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
          />
          <input
            type="date"
            value={form.data_entrada}
            onChange={(e) => setForm((f) => ({ ...f, data_entrada: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="number"
            placeholder="Km entrada"
            value={form.km_entrada}
            onChange={(e) => setForm((f) => ({ ...f, km_entrada: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Local (opcional)"
            value={form.local}
            onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            type="button"
            disabled={criarMutation.isPending || !form.veiculo_id}
            onClick={() => criarMutation.mutate()}
            className="w-full py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}
