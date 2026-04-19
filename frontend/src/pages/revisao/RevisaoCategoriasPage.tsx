import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import { revisaoCategoriaService } from '../../services/revisaoCategoriaService'
import type { RevisaoCategoria, RevisaoChecklistItem } from '../../types'
import { fnExtrairMensagemErroApi } from '../../utils/erroApi'

export default function RevisaoCategoriasPage() {
  const queryClient = useQueryClient()
  const [modalCategoria, setModalCategoria] = useState(false)
  const [modalItem, setModalItem] = useState<{ categoriaId: number; item: RevisaoChecklistItem | null } | null>(
    null,
  )
  const [objCategoriaEdit, setObjCategoriaEdit] = useState<RevisaoCategoria | null>(null)
  const [formCat, setFormCat] = useState({ nome: '', slug: '', ordem: '0' })
  const [formItem, setFormItem] = useState({ chave: '', label: '', ordem: '0' })

  const { data: arrCategorias = [], isLoading } = useQuery({
    queryKey: ['revisao-categorias'],
    queryFn: () => revisaoCategoriaService.listar(),
  })

  const salvarCatMutation = useMutation({
    mutationFn: () =>
      objCategoriaEdit
        ? revisaoCategoriaService.atualizar(objCategoriaEdit.id, {
            nome: formCat.nome.trim(),
            slug: formCat.slug.trim() || null,
            ordem: Number(formCat.ordem) || 0,
          })
        : revisaoCategoriaService.criar({
            nome: formCat.nome.trim(),
            slug: formCat.slug.trim() || undefined,
            ordem: Number(formCat.ordem) || 0,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisao-categorias'] })
      setModalCategoria(false)
      setObjCategoriaEdit(null)
    },
  })

  const excluirCatMutation = useMutation({
    mutationFn: (id: number) => revisaoCategoriaService.excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisao-categorias'] }),
  })

  const salvarItemMutation = useMutation({
    mutationFn: () => {
      if (!modalItem) throw new Error()
      const payload = {
        chave: formItem.chave.trim(),
        label: formItem.label.trim(),
        ordem: Number(formItem.ordem) || 0,
      }
      return modalItem.item
        ? revisaoCategoriaService.atualizarItem(modalItem.item.id, {
            ...payload,
            revisao_categoria_id: modalItem.categoriaId,
          })
        : revisaoCategoriaService.criarItem(modalItem.categoriaId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisao-categorias'] })
      setModalItem(null)
    },
  })

  const excluirItemMutation = useMutation({
    mutationFn: (id: number) => revisaoCategoriaService.excluirItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisao-categorias'] }),
  })

  function abrirNovaCategoria() {
    salvarCatMutation.reset()
    setObjCategoriaEdit(null)
    setFormCat({ nome: '', slug: '', ordem: '0' })
    setModalCategoria(true)
  }

  function abrirEditarCategoria(c: RevisaoCategoria) {
    salvarCatMutation.reset()
    setObjCategoriaEdit(c)
    setFormCat({ nome: c.nome, slug: c.slug, ordem: String(c.ordem) })
    setModalCategoria(true)
  }

  function abrirNovoItem(categoriaId: number) {
    salvarItemMutation.reset()
    setModalItem({ categoriaId, item: null })
    setFormItem({ chave: '', label: '', ordem: '0' })
  }

  function abrirEditarItem(categoriaId: number, item: RevisaoChecklistItem) {
    salvarItemMutation.reset()
    setModalItem({ categoriaId, item })
    setFormItem({
      chave: item.chave,
      label: item.label,
      ordem: String(item.ordem),
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FolderTree className="text-brand-secondary" size={26} />
          Categorias do checklist
        </h2>
        <button
          type="button"
          onClick={abrirNovaCategoria}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover text-sm font-medium"
        >
          <Plus size={18} /> Nova categoria
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-6 max-w-2xl">
        Defina as categorias e os itens que aparecem no formulário de checklist de revisão. A{' '}
        <span className="font-mono text-xs bg-gray-100 px-1 rounded">chave</span> identifica o item no JSON
        salvo (apenas letras minúsculas, números e sublinhado).
      </p>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Carregando…</div>
      ) : (
        <div className="space-y-6">
          {arrCategorias.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div>
                  <h2 className="font-semibold text-gray-900">{cat.nome}</h2>
                  <p className="text-xs text-gray-500 font-mono">
                    {cat.slug} · ordem {cat.ordem}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEditarCategoria(cat)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white"
                  >
                    <Pencil size={16} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Excluir esta categoria e todos os itens?')) excluirCatMutation.mutate(cat.id)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Itens</span>
                  <button
                    type="button"
                    onClick={() => abrirNovoItem(cat.id)}
                    className="text-sm text-brand-secondary font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <Plus size={16} /> Novo item
                  </button>
                </div>
                {!cat.itens_checklist?.length ? (
                  <p className="text-sm text-gray-500">Nenhum item cadastrado.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                    {cat.itens_checklist
                      .slice()
                      .sort((a, b) => a.ordem - b.ordem)
                      .map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                        >
                          <div>
                            <span className="text-gray-900">{item.label}</span>
                            <span className="block text-xs font-mono text-gray-500">{item.chave}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => abrirEditarItem(cat.id, item)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                              aria-label="Editar item"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Excluir este item?')) excluirItemMutation.mutate(item.id)
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              aria-label="Excluir item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        aberto={modalCategoria}
        aoFechar={() => {
          salvarCatMutation.reset()
          setModalCategoria(false)
          setObjCategoriaEdit(null)
        }}
        titulo={objCategoriaEdit ? 'Editar categoria' : 'Nova categoria'}
      >
        <div className="space-y-3">
          {salvarCatMutation.isError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {fnExtrairMensagemErroApi(salvarCatMutation.error)}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nome</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={formCat.nome}
              onChange={(e) => setFormCat((f) => ({ ...f, nome: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Slug (opcional)</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="motor"
              value={formCat.slug}
              onChange={(e) => setFormCat((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ordem</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={formCat.ordem}
              onChange={(e) => setFormCat((f) => ({ ...f, ordem: e.target.value }))}
            />
          </div>
          <button
            type="button"
            onClick={() => salvarCatMutation.mutate()}
            disabled={!formCat.nome.trim() || salvarCatMutation.isPending}
            className="w-full py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50"
          >
            {salvarCatMutation.isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </Modal>

      <Modal
        aberto={!!modalItem}
        aoFechar={() => {
          salvarItemMutation.reset()
          setModalItem(null)
        }}
        titulo={modalItem?.item ? 'Editar item' : 'Novo item'}
      >
        <div className="space-y-3">
          {salvarItemMutation.isError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {fnExtrairMensagemErroApi(salvarItemMutation.error)}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Chave (JSON)</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="motor_oleo"
              disabled={!!modalItem?.item}
              value={formItem.chave}
              onChange={(e) => setFormItem((f) => ({ ...f, chave: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={formItem.label}
              onChange={(e) => setFormItem((f) => ({ ...f, label: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ordem</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={formItem.ordem}
              onChange={(e) => setFormItem((f) => ({ ...f, ordem: e.target.value }))}
            />
          </div>
          <button
            type="button"
            onClick={() => salvarItemMutation.mutate()}
            disabled={
              !formItem.chave.trim() ||
              !formItem.label.trim() ||
              salvarItemMutation.isPending
            }
            className="w-full py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50"
          >
            {salvarItemMutation.isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
