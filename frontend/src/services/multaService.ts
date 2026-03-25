import api, { postFormData } from './api'
import type { Multa, PaginatedResponse } from '../types'

export const multaService = {
  listar: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Multa>>('/multas', { params }).then((r) => r.data),

  listarPorVeiculo: (veiculoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<Multa>>(`/veiculos/${veiculoId}/multas`, { params })
      .then((r) => r.data),

  buscar: (id: number) => api.get<Multa>(`/multas/${id}`).then((r) => r.data),

  criar: (formData: FormData) =>
    postFormData<Multa>('/multas', formData).then((r) => r.data),

  atualizar: (id: number, formData: FormData) =>
    api.put<Multa>(`/multas/${id}`, formData).then((r) => r.data),

  excluir: (id: number) => api.delete(`/multas/${id}`),

  marcarPaga: (id: number) =>
    api.patch<Multa>(`/multas/${id}/pagar`).then((r) => r.data),
}
