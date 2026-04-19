import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { despesaService } from '../../services/despesaService'
import { veiculoService } from '../../services/veiculoService'
import type { Despesa } from '../../types'
import { formatarMoedaBrl } from '../../utils/format'

const statusCores: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  PAGO: 'bg-green-100 text-green-700',
}

type FormState = {
  veiculo_id: string
  categoria: string
  descricao: string
  valor: string
  data_vencimento: string
  observacoes: string
}

const formVazio: FormState = {
  veiculo_id: '',
  categoria: '',
  descricao: '',
  valor: '',
  data_vencimento: '',
  observacoes: '',
}

function rotuloData(d: Despesa): string {
  if (d.status === 'PAGO' && d.data_pagamento) return d.data_pagamento
  return d.data_vencimento ?? ''
}

export default function DespesasPage() {
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Despesa | null>(null)
  const [form, setForm] = useState<FormState>(formVazio)

  const { data, isLoading } = useQuery({
    queryKey: ['despesas'],
    queryFn: () => despesaService.listar(),
  })

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'select'],
    queryFn: () => veiculoService.listar({ per_page: 500 }),
  })

  const salvarMutation = useMutation({
    mutationFn: (payload: Partial<Despesa>) =>
      editando ? despesaService.atualizar(editando.id, payload) : despesaService.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] })
      setModalAberto(false)
      setEditando(null)
      setForm(formVazio)
    },
  })

  const pagarMutation = useMutation({
    mutationFn: (id: number) => despesaService.pagar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['despesas'] }),
  })

  const despesas = data?.data ?? []
  const veiculos = veiculosData?.data ?? []

  function abrirNovo() {
    setEditando(null)
    setForm(formVazio)
    setModalAberto(true)
  }

  function abrirEditar(d: Despesa) {
    setEditando(d)
    setForm({
      veiculo_id: String(d.veiculo_id),
      categoria: d.categoria ?? '',
      descricao: d.descricao,
      valor: d.valor,
      data_vencimento: d.data_vencimento?.slice(0, 10) ?? '',
      observacoes: d.observacoes ?? '',
    })
    setModalAberto(true)
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const payload: Partial<Despesa> = {
      veiculo_id: Number(form.veiculo_id),
      categoria: form.categoria.trim() || null,
      descricao: form.descricao,
      valor: form.valor,
      data_vencimento: form.data_vencimento || null,
      observacoes: form.observacoes.trim() || null,
    }
    salvarMutation.mutate(payload)
  }

  const arrColumns: Column<Despesa>[] = [
    {
      strLabel: 'Data',
      strKey: 'data',
      render: (d) => (
        <span className="text-gray-700">
          {rotuloData(d) ? new Date(rotuloData(d)).toLocaleDateString('pt-BR') : '\u2014'}
        </span>
      ),
    },
    {
      strLabel: 'Status',
      strKey: 'status',
      render: (d) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCores[d.status] ?? ''}`}>
          {d.status}
        </span>
      ),
    },
    {
      strLabel: 'Categoria',
      strKey: 'categoria',
      render: (d) => <span className="text-gray-900 font-medium">{d.categoria ?? '\u2014'}</span>,
      bolHideMobile: true,
    },
    {
      strLabel: 'Descrição',
      strKey: 'descricao',
      render: (d) => <span className="text-gray-700">{d.descricao}</span>,
    },
    {
      strLabel: 'Veículo',
      strKey: 'veiculo',
      render: (d) => (
        <span className="text-gray-700">
          {d.veiculo ? `${d.veiculo.placa}` : `#${d.veiculo_id}`}
        </span>
      ),
      bolHideMobile: true,
    },
    {
      strLabel: 'Valor',
      strKey: 'valor',
      render: (d) => <span className="text-gray-700">{formatarMoedaBrl(d.valor)}</span>,
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Despesas</h2>
        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover transition-colors text-sm font-medium"
        >
          <Plus size={18} /> Nova despesa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ResponsiveTable
          arrColumns={arrColumns}
          arrData={despesas}
          fnKeyExtractor={(d) => d.id}
          bolLoading={isLoading}
          strEmptyMessage="Nenhuma despesa registrada."
          fnRenderCardHeader={(d) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{d.descricao}</p>
                <p className="text-xs text-gray-500">
                  {d.veiculo ? d.veiculo.placa : `#${d.veiculo_id}`}
                  {d.categoria ? ` - ${d.categoria}` : ''}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCores[d.status] ?? ''}`}>
                {d.status}
              </span>
            </div>
          )}
          fnRenderActions={(d) => (
            <div className="flex items-center gap-2">
              {d.status === 'PENDENTE' && (
                <button
                  type="button"
                  title="Marcar pago"
                  disabled={pagarMutation.isPending}
                  onClick={() => {
                    if (confirm('Marcar esta despesa como paga?')) pagarMutation.mutate(d.id)
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => abrirEditar(d)}
                className="p-2 text-gray-500 hover:text-brand-secondary rounded-lg hover:bg-brand-secondary-muted"
                title="Editar despesa"
                aria-label="Editar despesa"
              >
                <Pencil size={16} aria-hidden />
              </button>
            </div>
          )}
        />
      </div>

      <Modal
        titulo={editando ? 'Editar despesa' : 'Nova despesa'}
        aberto={modalAberto}
        aoFechar={() => {
          setModalAberto(false)
          setEditando(null)
          setForm(formVazio)
        }}
      >
        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veículo *</label>
            <select
              required
              value={form.veiculo_id}
              onChange={(e) => setForm((f) => ({ ...f, veiculo_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.modelo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input
              type="text"
              required
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
            <input
              type="text"
              required
              value={form.valor}
              onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de vencimento</label>
            <input
              type="date"
              value={form.data_vencimento}
              onChange={(e) => setForm((f) => ({ ...f, data_vencimento: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {salvarMutation.isError && (
            <p className="text-sm text-red-600">
              {(salvarMutation.error as Error)?.message || 'Erro ao salvar.'}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalAberto(false)
                setEditando(null)
                setForm(formVazio)
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvarMutation.isPending}
              className="px-4 py-2 text-sm bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-60"
            >
              {salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
