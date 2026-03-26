import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Receipt } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import { pagamentoService } from '../../services/pagamentoService'
import type { Pagamento } from '../../types'
import { formatarMoedaBrl } from '../../utils/format'

const statusCores: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  PAGO: 'bg-green-100 text-green-700',
  ATRASADO: 'bg-red-100 text-red-700',
}

type ModoLista = 'todos' | 'inadimplentes'

type FormRegistrar = {
  comprovante: File | null
  valor: string
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO'
}

const formRegistrarVazio: FormRegistrar = {
  comprovante: null,
  valor: '',
  status: 'PAGO',
}

export default function PagamentosPage() {
  const queryClient = useQueryClient()
  const [modo, setModo] = useState<ModoLista>('todos')
  const [modalRegistrar, setModalRegistrar] = useState(false)
  const [pagamentoAlvo, setPagamentoAlvo] = useState<Pagamento | null>(null)
  const [formRegistrar, setFormRegistrar] = useState<FormRegistrar>(formRegistrarVazio)

  const { data, isLoading } = useQuery({
    queryKey: ['pagamentos', modo],
    queryFn: () =>
      modo === 'inadimplentes'
        ? pagamentoService.listarInadimplentes()
        : pagamentoService.listar(),
  })

  const registrarMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      pagamentoService.registrar(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] })
      setModalRegistrar(false)
      setPagamentoAlvo(null)
      setFormRegistrar(formRegistrarVazio)
    },
  })

  const pagamentos = data?.data ?? []

  function abrirRegistrar(p: Pagamento) {
    setPagamentoAlvo(p)
    setFormRegistrar({
      ...formRegistrarVazio,
      valor: p.valor,
      status: p.status === 'ATRASADO' ? 'PAGO' : p.status,
    })
    setModalRegistrar(true)
  }

  function enviarRegistrar(e: React.FormEvent) {
    e.preventDefault()
    if (!pagamentoAlvo || !formRegistrar.comprovante) return
    const fd = new FormData()
    fd.append('comprovante', formRegistrar.comprovante)
    fd.append('valor', formRegistrar.valor)
    fd.append('status', formRegistrar.status)
    registrarMutation.mutate({ id: pagamentoAlvo.id, formData: fd })
  }

  const msgErroRegistrar =
    registrarMutation.error && axios.isAxiosError(registrarMutation.error)
      ? String(
          (registrarMutation.error.response?.data as { message?: string })?.message ??
            registrarMutation.error.message,
        )
      : registrarMutation.error
        ? (registrarMutation.error as Error).message
        : null

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pagamentos</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Listagem:</label>
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as ModoLista)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="inadimplentes">Inadimplentes</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : pagamentos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum pagamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Ref.
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Contrato
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Veículo
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Condutor
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagamentos.map((p: Pagamento) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(p.data_referencia).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {p.contrato?.numero_contrato ?? `#${p.contrato_id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {p.veiculo?.placa ?? `#${p.veiculo_id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {p.condutor?.nome ?? `#${p.condutor_id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formatarMoedaBrl(p.valor)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusCores[p.status] ?? ''}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => abrirRegistrar(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary-muted rounded-lg hover:bg-brand-primary-border/50"
                      >
                        <Receipt size={16} /> Registrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        titulo="Registrar pagamento"
        aberto={modalRegistrar}
        aoFechar={() => {
          setModalRegistrar(false)
          setPagamentoAlvo(null)
          setFormRegistrar(formRegistrarVazio)
        }}
      >
        <form onSubmit={enviarRegistrar} className="space-y-4">
          {pagamentoAlvo && (
            <p className="text-sm text-gray-600">
              Pagamento #{pagamentoAlvo.id} — ref.{' '}
              {new Date(pagamentoAlvo.data_referencia).toLocaleDateString('pt-BR')}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comprovante *</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              required
              onChange={(e) =>
                setFormRegistrar((f) => ({ ...f, comprovante: e.target.files?.[0] ?? null }))
              }
              className="w-full text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">JPG, PNG ou PDF (máx. 10 MB).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
            <input
              type="text"
              required
              placeholder="0.00"
              value={formRegistrar.valor}
              onChange={(e) => setFormRegistrar((f) => ({ ...f, valor: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={formRegistrar.status}
              onChange={(e) =>
                setFormRegistrar((f) => ({
                  ...f,
                  status: e.target.value as FormRegistrar['status'],
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATRASADO">Atrasado</option>
            </select>
          </div>
          {msgErroRegistrar && <p className="text-sm text-red-600">{msgErroRegistrar}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalRegistrar(false)
                setPagamentoAlvo(null)
                setFormRegistrar(formRegistrarVazio)
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={registrarMutation.isPending}
              className="px-4 py-2 text-sm bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-60"
            >
              {registrarMutation.isPending ? 'Enviando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
