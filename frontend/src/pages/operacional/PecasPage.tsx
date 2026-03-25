import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import { pecaService } from '../../services/pecaService'
import type { Peca } from '../../types'
import { formatarMoedaBrl } from '../../utils/format'

export default function PecasPage() {
  const queryClient = useQueryClient()
  const [modalPeca, setModalPeca] = useState(false)
  const [modalMov, setModalMov] = useState<Peca | null>(null)
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" size={28} />
            Pecas e estoque
          </h1>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Plus size={18} /> Nova peca
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Min.</th>
              <th className="px-4 py-3">Custo medio</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : (
              lista.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{p.nome}</td>
                  <td className="px-4 py-3">{p.codigo ?? '—'}</td>
                  <td className="px-4 py-3">{p.quantidade_estoque}</td>
                  <td className="px-4 py-3">{p.estoque_minimo ?? '—'}</td>
                  <td className="px-4 py-3">
                    {p.custo_medio ? formatarMoedaBrl(Number(p.custo_medio)) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setModalMov(p)}
                      className="text-blue-600 text-sm"
                    >
                      Movimentar
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirEditar(p)}
                      className="text-gray-600 inline-flex items-center gap-1"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
            className="w-full py-2 bg-blue-600 text-white rounded-lg"
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
              className="w-full py-2 bg-blue-600 text-white rounded-lg"
            >
              Registrar
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
