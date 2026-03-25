import api, { postFormData } from './api'
import type { LeituraKm, PaginatedResponse } from '../types'

export const leituraKmService = {
  listarPorVeiculo: (veiculoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<LeituraKm>>(`/veiculos/${veiculoId}/leituras-km`, { params })
      .then((r) => r.data),

  criar: (veiculoId: number, formData: FormData) =>
    postFormData<LeituraKm>(`/veiculos/${veiculoId}/leituras-km`, formData),
}
