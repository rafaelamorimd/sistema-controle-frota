import api, { postFormData } from './api'
import type { Pagamento, PaginatedResponse } from '../types'

export const pagamentoService = {
  listar: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Pagamento>>('/pagamentos', { params }).then((r) => r.data),

  listarPorContrato: (contratoId: number, params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<Pagamento>>(`/contratos/${contratoId}/pagamentos`, { params })
      .then((r) => r.data),

  listarInadimplentes: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Pagamento>>('/pagamentos/inadimplentes', { params }).then((r) => r.data),

  registrar: (pagamentoId: number, formData: FormData) =>
    postFormData<Pagamento>(`/pagamentos/${pagamentoId}/registrar`, formData),
}
