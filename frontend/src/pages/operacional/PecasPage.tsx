import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'
import { pecaService } from '../../services/pecaService'
import type { MovimentacaoPeca, Peca } from '../../types'
import { formatarMoedaBrl } from '../../utils/format'

export default function PecasPage() {
  const queryClient = useQueryClient()
  const [modalPeca, setModalPeca] = useState(false)
  const [modalMov, setModalMov] = useState<Peca | null>(null)
  const [modalHistorico, setModalHistorico] = useState<Peca | null>(null)
  const [editando, setEditando] = useState<Peca | null>(null)
  const [form, setForm] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    quantidade_estoque: '0',
    estoque_minimo: '',
    custo_medio: '',
  })
  const [movForm, setMovForm] = useState({
    tipo: 'ENTRADA' as 'ENTRADA' | 'SAIDA',
    quantidade: '1',
    custo_unitario: '',
    observacao: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['pecas'],
    queryFn: () => pecaService.listar({ por_pagina: 100 }),
  })

  const salvarMutation = useMutation({
    mutationFn: () =>
      editando
        ? pecaService.atualizar(editando.id, {
            nome: form.nome,
            codigo: form.codigo || null,
            categoria: form.categoria || null,
            quantidade_estoque: Number(form.quantidade_estoque),
            estoque_minimo: form.estoque_minimo ? Number(form.estoque_minimo) : null,
            custo_medio: form.custo_medio ? form.custo_medio : null,
          })
        : pecaService.criar({
            nome: form.nome,
            codigo: form.codigo || null,
            categoria: form.categoria || null,
            quantidade_estoque: Number(form.quantidade_estoque),
            estoque_minimo: form.estoque_minimo ? Number(form.estoque_minimo) : null,
            custo_medio: form.custo_medio ? form.custo_medio : null,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pecas'] })
      setModalPeca(false)
      setEditando(null)
      setForm({
        nome: '',
        codigo: '',
        categoria: '',
        quantidade_estoque: '0',
        estoque_minimo: '',
        custo_medio: '',
      })
    },
  })

  const movMutation = useMutation({
    mutationFn: () =>
      pecaService.movimentar(modalMov!.id, {
        tipo: movForm.tipo,
        quantidade: Number(movForm.quantidade),
        custo_unitario: movForm.custo_unitario ? Number(movForm.custo_unitario) : undefined,
        observacao: movForm.observacao || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pecas'] })
      setModalMov(null)
    },
  })

  const lista = data?.data ?? []
  const { data: historicoData, isLoading: bolCarregandoHistorico } = useQuery({
    queryKey: ['movimentacoes-peca', modalHistorico?.id],
    queryFn: () => pecaService.listarMovimentacoes(modalHistorico!.id, { por_pagina: 50 }),
    enabled: !!modalHistorico,
  })

  function abrirNovo() {
    setEditando(null)
    setForm({
      nome: '',
      codigo: '',
      categoria: '',
      quantidade_estoque: '0',
      estoque_minimo: '',
      custo_medio: '',
    })
    setModalPeca(true)
  }

  function abrirEditar(p: Peca) {
    setEditando(p)
    setForm({
      nome: p.nome,
      codigo: p.codigo ?? '',
      categoria: p.categoria ?? '',
      quantidade_estoque: String(p.quantidade_estoque),
      estoque_minimo: p.estoque_minimo != null ? String(p.estoque_minimo) : '',
      custo_medio: p.custo_medio ?? '',
    })
    setModalPeca(true)
  }

  const arrColumns: Column<Peca>[] = [
    {
      strLabel: 'Nome',
      strKey: 'nome',
      render: (p) => <span className="font-medium text-gray-900">{p.nome}</span>,
    },
    {
      strLabel: 'Codigo',
      strKey: 'codigo',
      render: (p) => <span className="text-gray-700">{p.codigo ?? '\u2014'}</span>,
      bolHideMobile: true,
    },
    {
      strLabel: 'Estoque',
      strKey: 'estoque',
      render: (p) => <span className="text-gray-700">{p.quantidade_estoque}</span>,
    },
    {
      strLabel: 'Min.',
      strKey: 'min',
      render: (p) => <span className="text-gray-700">{p.estoque_minimo ?? '\u2014'}</span>,
      bolHideMobile: true,
    },
    {
      strLabel: 'Custo medio',
      strKey: 'custo',
      render: (p) => (
        <span className="text-gray-700">
          {p.custo_medio ? formatarMoedaBrl(Number(p.custo_medio)) : '\u2014'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-brand-secondary" size={28} />
            Pecas e estoque
          </h1>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover text-sm font-medium"
        >
          <Plus size={18} /> Nova peca
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ResponsiveTable
          arrColumns={arrColumns}
          arrData={lista}
          fnKeyExtractor={(p) => p.id}
          bolLoading={isLoading}
          strEmptyMessage="Nenhuma peca cadastrada."
          fnRenderCardHeader={(p) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{p.nome}</p>
                {p.codigo && <p className="text-xs text-gray-500">{p.codigo}</p>}
              </div>
              <span className="text-sm font-semibold text-brand-primary">
                Qtd: {p.quantidade_estoque}
              </span>
            </div>
          )}
          fnRenderActions={(p) => (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalMov(p)}
                className="text-brand-secondary text-sm hover:text-brand-secondary-hover font-medium"
              >
                Movimentar
              </button>
              <button
                type="button"
                onClick={() => setModalHistorico(p)}
                className="text-blue-600 text-sm hover:text-blue-700 font-medium"
              >
                Historico
              </button>
              <button
                type="button"
                onClick={() => abrirEditar(p)}
                className="p-2 text-gray-500 hover:text-brand-secondary rounded-lg hover:bg-brand-secondary-muted"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        />
      </div>

      <Modal aberto={modalPeca} aoFechar={() => setModalPeca(false)} titulo={editando ? 'Editar peca' : 'Nova peca'}>
        <div className="space-y-2">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Codigo"
            value={form.codigo}
            onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Categoria"
            value={form.categoria}
            onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
          />
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Quantidade"
            value={form.quantidade_estoque}
            onChange={(e) => setForm((f) => ({ ...f, quantidade_estoque: e.target.value }))}
          />
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Estoque minimo"
            value={form.estoque_minimo}
            onChange={(e) => setForm((f) => ({ ...f, estoque_minimo: e.target.value }))}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Custo medio"
            value={form.custo_medio}
            onChange={(e) => setForm((f) => ({ ...f, custo_medio: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => salvarMutation.mutate()}
            className="w-full py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover"
          >
            Salvar
          </button>
        </div>
      </Modal>

      <Modal aberto={!!modalMov} aoFechar={() => setModalMov(null)} titulo="Movimentacao">
        {modalMov && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{modalMov.nome}</p>
            <select
              value={movForm.tipo}
              onChange={(e) =>
                setMovForm((f) => ({ ...f, tipo: e.target.value as 'ENTRADA' | 'SAIDA' }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saida</option>
            </select>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={movForm.quantidade}
              onChange={(e) => setMovForm((f) => ({ ...f, quantidade: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Custo unitario (entrada)"
              value={movForm.custo_unitario}
              onChange={(e) => setMovForm((f) => ({ ...f, custo_unitario: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Observacao"
              value={movForm.observacao}
              onChange={(e) => setMovForm((f) => ({ ...f, observacao: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => movMutation.mutate()}
              className="w-full py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover"
            >
              Registrar
            </button>
          </div>
        )}
      </Modal>

      <Modal aberto={!!modalHistorico} aoFechar={() => setModalHistorico(null)} titulo="Historico de movimentacoes">
        {modalHistorico && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Peca: <span className="font-medium">{modalHistorico.nome}</span>
            </p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Quantidade</th>
                    <th className="px-3 py-2">Custo unitario</th>
                    <th className="px-3 py-2">Observacao</th>
                  </tr>
                </thead>
                <tbody>
                  {bolCarregandoHistorico ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                        Carregando...
                      </td>
                    </tr>
                  ) : (historicoData?.data?.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                        Nenhuma movimentacao registrada.
                      </td>
                    </tr>
                  ) : (
                    historicoData!.data.map((objMov: MovimentacaoPeca) => (
                      <tr key={objMov.id} className="border-t border-gray-100">
                        <td className="px-3 py-2">{new Date(objMov.created_at).toLocaleString('pt-BR')}</td>
                        <td className="px-3 py-2">{objMov.tipo}</td>
                        <td className="px-3 py-2">{objMov.quantidade}</td>
                        <td className="px-3 py-2">
                          {objMov.custo_unitario ? formatarMoedaBrl(Number(objMov.custo_unitario)) : '—'}
                        </td>
                        <td className="px-3 py-2">{objMov.observacao || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
