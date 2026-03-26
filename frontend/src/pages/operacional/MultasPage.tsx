import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Gavel, Plus } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { multaService } from '../../services/multaService'
import { veiculoService } from '../../services/veiculoService'
import type { Multa } from '../../types'
import { formatarMoedaBrl } from '../../utils/format'

const statusCores: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  PAGA: 'bg-green-100 text-green-700',
  RECURSO: 'bg-blue-100 text-blue-700',
  TRANSFERIDA_CONDUTOR: 'bg-purple-100 text-purple-700',
}

export default function MultasPage() {
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Multa | null>(null)
  const [form, setForm] = useState({
    veiculo_id: '',
    data_infracao: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    status: 'PENDENTE' as Multa['status'],
  })
  const [arquivo, setArquivo] = useState<File | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['multas'],
    queryFn: () => multaService.listar({ por_pagina: 100 }),
  })

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ por_pagina: 500 }),
  })

  function montarFormData(): FormData {
    const fd = new FormData()
    fd.append('veiculo_id', form.veiculo_id)
    fd.append('data_infracao', form.data_infracao)
    fd.append('descricao', form.descricao)
    fd.append('valor', form.valor)
    fd.append('data_vencimento', form.data_vencimento)
    fd.append('status', form.status)
    if (arquivo) fd.append('comprovante', arquivo)
    return fd
  }

  const salvarMutation = useMutation({
    mutationFn: () =>
      editando
        ? multaService.atualizar(editando.id, montarFormData())
        : multaService.criar(montarFormData()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multas'] })
      setModalAberto(false)
      setEditando(null)
      setArquivo(null)
    },
  })

  const pagarMutation = useMutation({
    mutationFn: (id: number) => multaService.marcarPaga(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['multas'] }),
  })

  const lista = data?.data ?? []
  const veiculos = veiculosData?.data ?? []

  function abrirNovo() {
    setEditando(null)
    setForm({
      veiculo_id: '',
      data_infracao: new Date().toISOString().slice(0, 16),
      descricao: '',
      valor: '',
      data_vencimento: '',
      status: 'PENDENTE',
    })
    setArquivo(null)
    setModalAberto(true)
  }

  function abrirEditar(m: Multa) {
    setEditando(m)
    setForm({
      veiculo_id: String(m.veiculo_id),
      data_infracao: m.data_infracao.slice(0, 16),
      descricao: m.descricao,
      valor: m.valor,
      data_vencimento: m.data_vencimento,
      status: m.status,
    })
    setArquivo(null)
    setModalAberto(true)
  }

  const arrColumns: Column<Multa>[] = [
    {
      strLabel: 'Veiculo',
      strKey: 'veiculo',
      render: (m) => <span className="text-gray-700">{m.veiculo?.placa ?? m.veiculo_id}</span>,
    },
    {
      strLabel: 'Infracao',
      strKey: 'infracao',
      render: (m) => <span className="text-gray-700 truncate max-w-xs block">{m.descricao}</span>,
    },
    {
      strLabel: 'Valor',
      strKey: 'valor',
      render: (m) => <span className="text-gray-700">{formatarMoedaBrl(Number(m.valor))}</span>,
    },
    {
      strLabel: 'Vencimento',
      strKey: 'vencimento',
      render: (m) => <span className="text-gray-700">{m.data_vencimento}</span>,
      bolHideMobile: true,
    },
    {
      strLabel: 'Status',
      strKey: 'status',
      render: (m) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCores[m.status] ?? ''}`}>
          {m.status}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gavel className="text-brand-secondary" size={28} />
            Multas
          </h1>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover text-sm font-medium"
        >
          <Plus size={18} /> Nova
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ResponsiveTable
          arrColumns={arrColumns}
          arrData={lista}
          fnKeyExtractor={(m) => m.id}
          bolLoading={isLoading}
          strEmptyMessage="Nenhuma multa registrada."
          fnRenderCardHeader={(m) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{m.veiculo?.placa ?? m.veiculo_id}</p>
                <p className="text-xs text-gray-500 truncate">{m.descricao}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCores[m.status] ?? ''}`}>
                {m.status}
              </span>
            </div>
          )}
          fnRenderActions={(m) => (
            <div className="flex items-center gap-2">
              {m.status === 'PENDENTE' && (
                <button
                  type="button"
                  className="text-green-600 text-sm font-medium"
                  onClick={() => pagarMutation.mutate(m.id)}
                >
                  Pagar
                </button>
              )}
              <button
                type="button"
                className="text-brand-secondary text-sm hover:text-brand-secondary-hover font-medium"
                onClick={() => abrirEditar(m)}
              >
                Editar
              </button>
            </div>
          )}
        />
      </div>

      <Modal aberto={modalAberto} aoFechar={() => setModalAberto(false)} titulo={editando ? 'Editar multa' : 'Nova multa'}>
        <div className="space-y-2">
          <select
            required
            value={form.veiculo_id}
            onChange={(e) => setForm((f) => ({ ...f, veiculo_id: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Veiculo</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="w-full border rounded-lg px-3 py-2"
            value={form.data_infracao}
            onChange={(e) => setForm((f) => ({ ...f, data_infracao: e.target.value }))}
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Valor"
            value={form.valor}
            onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
          />
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2"
            value={form.data_vencimento}
            onChange={(e) => setForm((f) => ({ ...f, data_vencimento: e.target.value }))}
          />
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Multa['status'] }))}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="PENDENTE">Pendente</option>
            <option value="PAGA">Paga</option>
            <option value="RECURSO">Recurso</option>
            <option value="TRANSFERIDA_CONDUTOR">Transferida condutor</option>
          </select>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
          <button
            type="button"
            disabled={salvarMutation.isPending || !form.veiculo_id}
            onClick={() => salvarMutation.mutate()}
            className="w-full py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover"
          >
            Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}
