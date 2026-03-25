import api from './api'
import type { Manutencao, ManutencaoItem, PaginatedResponse } from '../types'

export const manutencaoService = {
  listar: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Manutencao>>('/manutencoes', { params }).then((r) => r.data),

  buscar: (id: number) => api.get<Manutencao>(`/manutencoes/${id}`).then((r) => r.data),

  criar: (dados: Record<string, unknown>) =>
    api.post<Manutencao>('/manutencoes', dados).then((r) => r.data),

  atualizar: (id: number, dados: Record<string, unknown>) =>
    api.put<Manutencao>(`/manutencoes/${id}`, dados).then((r) => r.data),

  excluir: (id: number) => api.delete(`/manutencoes/${id}`),

  concluir: (id: number, data_saida?: string) =>
    api.patch<Manutencao>(`/manutencoes/${id}/concluir`, { data_saida }).then((r) => r.data),

  adicionarItem: (manutencaoId: number, dados: Record<string, unknown>) =>
    api.post<ManutencaoItem>(`/manutencoes/${manutencaoId}/itens`, dados).then((r) => r.data),
}
