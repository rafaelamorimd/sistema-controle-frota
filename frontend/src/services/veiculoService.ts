import api from './api'
import type { Veiculo, PaginatedResponse } from '../types'

export const veiculoService = {
  listar: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<Veiculo>>('/veiculos', { params }).then(r => r.data),

  buscar: (id: number) =>
    api.get<Veiculo>(`/veiculos/${id}`).then(r => r.data),

  criar: (dados: Partial<Veiculo>) =>
    api.post<Veiculo>('/veiculos', dados).then(r => r.data),

  atualizar: (id: number, dados: Partial<Veiculo>) =>
    api.put<Veiculo>(`/veiculos/${id}`, dados).then(r => r.data),

  alterarStatus: (id: number, status: string) =>
    api.patch<Veiculo>(`/veiculos/${id}/status`, { status }).then(r => r.data),

  excluir: (id: number) =>
    api.delete(`/veiculos/${id}`),
}
