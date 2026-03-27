import type { ChecklistRevisao, ChecklistRevisaoFoto, PaginatedResponse } from '../types'
import api, { postFormData } from './api'

export const checklistRevisaoService = {
  listarPorVeiculo: (veiculoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<ChecklistRevisao>>(`/veiculos/${veiculoId}/checklist-revisoes`, {
        params,
      })
      .then((r) => r.data),

  obter: (id: number) => api.get<ChecklistRevisao>(`/checklist-revisoes/${id}`).then((r) => r.data),

  criar: (dados: Record<string, unknown>) =>
    api.post<ChecklistRevisao>('/checklist-revisoes', dados).then((r) => r.data),

  atualizar: (id: number, dados: Record<string, unknown>) =>
    api.put<ChecklistRevisao>(`/checklist-revisoes/${id}`, dados).then((r) => r.data),

  excluir: (id: number) => api.delete(`/checklist-revisoes/${id}`),

  adicionarFoto: (checklistId: number, arquivo: File) => {
    const fd = new FormData()
    fd.append('foto', arquivo)
    return postFormData<ChecklistRevisaoFoto>(`/checklist-revisoes/${checklistId}/fotos`, fd).then((r) => r.data)
  },

  removerFoto: (checklistId: number, fotoId: number) =>
    api.delete(`/checklist-revisoes/${checklistId}/fotos/${fotoId}`),
}
