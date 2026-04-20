import api, { postFormData } from './api'
import type { LeituraKm, Pagamento, PaginatedResponse } from '../types'

export const leituraKmService = {
  listarPorVeiculo: (veiculoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<LeituraKm>>(`/veiculos/${veiculoId}/leituras-km`, { params })
      .then((r) => r.data),

  listarPagamentosElegiveis: (veiculoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<Pagamento>>(`/veiculos/${veiculoId}/pagamentos-elegiveis-leitura-km`, {
        params,
      })
      .then((r) => r.data),

  criar: (veiculoId: number, formData: FormData) =>
    postFormData<LeituraKm>(`/veiculos/${veiculoId}/leituras-km`, formData),
}
