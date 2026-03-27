import api from './api'
import type { RevisaoCategoria, RevisaoChecklistItem } from '../types'

export const revisaoCategoriaService = {
  listar: () => api.get<RevisaoCategoria[]>('/revisao/categorias').then((r) => r.data),

  criar: (dados: { nome: string; slug?: string | null; ordem?: number }) =>
    api.post<RevisaoCategoria>('/revisao/categorias', dados).then((r) => r.data),

  atualizar: (id: number, dados: Partial<{ nome: string; slug: string | null; ordem: number }>) =>
    api.put<RevisaoCategoria>(`/revisao/categorias/${id}`, dados).then((r) => r.data),

  excluir: (id: number) => api.delete(`/revisao/categorias/${id}`),

  criarItem: (
    categoriaId: number,
    dados: { chave: string; label: string; ordem?: number },
  ) =>
    api
      .post<RevisaoChecklistItem>(`/revisao/categorias/${categoriaId}/itens`, dados)
      .then((r) => r.data),

  atualizarItem: (
    itemId: number,
    dados: Partial<{ chave: string; label: string; ordem: number; revisao_categoria_id: number }>,
  ) => api.put<RevisaoChecklistItem>(`/revisao/itens/${itemId}`, dados).then((r) => r.data),

  excluirItem: (itemId: number) => api.delete(`/revisao/itens/${itemId}`),
}
