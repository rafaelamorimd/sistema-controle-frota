import api from './api'
import type { Contrato, PaginatedResponse } from '../types'

export const contratoService = {
  listar: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<Contrato>>('/contratos', { params }).then(r => r.data),

  buscar: (id: number) =>
    api.get<Contrato>(`/contratos/${id}`).then(r => r.data),

  criar: (dados: Partial<Contrato>) =>
    api.post<Contrato>('/contratos', dados).then(r => r.data),

  atualizar: (id: number, dados: Partial<Contrato>) =>
    api.put<Contrato>(`/contratos/${id}`, dados).then(r => r.data),

  encerrar: (id: number, dados: { km_final?: number; motivo_encerramento?: string }) =>
    api.patch<Contrato>(`/contratos/${id}/encerrar`, dados).then(r => r.data),

  gerarPdf: async (id: number): Promise<Blob> => {
    const res = await api.post(`/contratos/${id}/gerar-pdf`, {}, {
      responseType: 'blob',
    });
    return res.data;
  },
}
