import api from './api'
import type { Alerta, PaginatedResponse } from '../types'

export const alertaService = {
  listar: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Alerta>>('/alertas', { params }).then((r) => r.data),

  marcarLido: (id: number) =>
    api.patch<Alerta>(`/alertas/${id}/lido`).then((r) => r.data),

  resolver: (id: number) =>
    api.patch<Alerta>(`/alertas/${id}/resolver`).then((r) => r.data),
}
