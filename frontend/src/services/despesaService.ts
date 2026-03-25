import api from './api'
import type { Despesa, PaginatedResponse } from '../types'

export const despesaService = {
  listar: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Despesa>>('/despesas', { params }).then((r) => r.data),

  listarPorVeiculo: (veiculoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<Despesa>>(`/veiculos/${veiculoId}/despesas`, { params })
      .then((r) => r.data),

  criar: (dados: Partial<Despesa>) =>
    api.post<Despesa>('/despesas', dados).then((r) => r.data),

  atualizar: (id: number, dados: Partial<Despesa>) =>
    api.put<Despesa>(`/despesas/${id}`, dados).then((r) => r.data),

  pagar: (id: number) => api.patch<Despesa>(`/despesas/${id}/pagar`).then((r) => r.data),
}
