import api from './api'
import type { RastreadorEvento } from '../types'

export const rastreadorService = {
  eventos: (veiculoId: number, limite = 50) =>
    api
      .get<RastreadorEvento[]>(`/veiculos/${veiculoId}/rastreador/eventos`, {
        params: { limite },
      })
      .then((r) => r.data),

  sincronizar: (veiculoId: number) =>
    api.post<RastreadorEvento>(`/veiculos/${veiculoId}/rastreador/sincronizar`).then((r) => r.data),
}
