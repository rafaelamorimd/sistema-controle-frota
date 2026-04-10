import api from './api'
import type {
  FulltrackAlerta,
  FulltrackPosicao,
  FulltrackVeiculo,
  RastreadorEvento,
  RastreadorResumoGps,
  Veiculo,
} from '../types'

export const rastreadorService = {
  eventos: (numVeiculoId: number, limite = 50) =>
    api
      .get<RastreadorEvento[]>(`/veiculos/${numVeiculoId}/rastreador/eventos`, {
        params: { limite },
      })
      .then((r) => r.data),

  sincronizar: (numVeiculoId: number) =>
    api.post<RastreadorEvento>(`/veiculos/${numVeiculoId}/rastreador/sincronizar`).then((r) => r.data),

  vinculoExterno: (numVeiculoId: number, veiculo_id_externo: string | null) =>
    api
      .post<Veiculo>(`/veiculos/${numVeiculoId}/rastreador/vinculo-externo`, { veiculo_id_externo })
      .then((r) => r.data),

  veiculosFulltrack: () => api.get<FulltrackVeiculo[]>('/rastreador/veiculos').then((r) => r.data),

  posicoes: (params?: { ignicao?: '0' | '1' }) =>
    api.get<FulltrackPosicao[]>('/rastreador/posicoes', { params }).then((r) => r.data),

  posicaoVeiculo: (strIdVeiculo: string) =>
    api.get<FulltrackPosicao[]>(`/rastreador/posicoes/${encodeURIComponent(strIdVeiculo)}`).then((r) => r.data),

  historicoPosicoes: (strIdVeiculo: string, strInicio: string, strFim: string) =>
    api
      .get<FulltrackPosicao[]>(`/rastreador/posicoes/${encodeURIComponent(strIdVeiculo)}/historico`, {
        params: { inicio: strInicio, fim: strFim },
      })
      .then((r) => r.data),

  alertasGps: () => api.get<FulltrackAlerta[]>('/rastreador/alertas-gps').then((r) => r.data),

  alertasGpsPeriodo: (strInicio: string, strFim: string) =>
    api
      .get<FulltrackAlerta[]>('/rastreador/alertas-gps/periodo', {
        params: { inicio: strInicio, fim: strFim },
      })
      .then((r) => r.data),

  resumoGps: () => api.get<RastreadorResumoGps>('/rastreador/resumo').then((r) => r.data),
}
