import api from './api'
import type { Peca, PaginatedResponse } from '../types'

export const pecaService = {
  listar: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Peca>>('/pecas', { params }).then((r) => r.data),

  buscar: (id: number) => api.get<Peca>(`/pecas/${id}`).then((r) => r.data),

  criar: (dados: Partial<Peca>) => api.post<Peca>('/pecas', dados).then((r) => r.data),

  atualizar: (id: number, dados: Partial<Peca>) =>
    api.put<Peca>(`/pecas/${id}`, dados).then((r) => r.data),

  excluir: (id: number) => api.delete(`/pecas/${id}`),

  movimentar: (pecaId: number, dados: Record<string, unknown>) =>
    api.post(`/pecas/${pecaId}/movimentacoes`, dados).then((r) => r.data),
}
