import api from './api'
import type { ChecklistRevisao, PaginatedResponse } from '../types'

export const checklistRevisaoService = {
  listarPorVeiculo: (veiculoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<ChecklistRevisao>>(`/veiculos/${veiculoId}/checklist-revisoes`, {
        params,
      })
      .then((r) => r.data),

  criar: (dados: Record<string, unknown>) =>
    api.post<ChecklistRevisao>('/checklist-revisoes', dados).then((r) => r.data),

  atualizar: (id: number, dados: Record<string, unknown>) =>
    api.put<ChecklistRevisao>(`/checklist-revisoes/${id}`, dados).then((r) => r.data),

  excluir: (id: number) => api.delete(`/checklist-revisoes/${id}`),
}
