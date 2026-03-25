import api from './api'
import type { Condutor, CondutorDocumento, CondutorReferencia, PaginatedResponse } from '../types'

export const condutorService = {
  listar: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<Condutor>>('/condutores', { params }).then(r => r.data),

  buscar: (id: number) =>
    api.get<Condutor>(`/condutores/${id}`).then(r => r.data),

  criar: (dados: Partial<Condutor>) =>
    api.post<Condutor>('/condutores', dados).then(r => r.data),

  atualizar: (id: number, dados: Partial<Condutor>) =>
    api.put<Condutor>(`/condutores/${id}`, dados).then(r => r.data),

  excluir: (id: number) =>
    api.delete(`/condutores/${id}`),

  uploadDocumento: (condutorId: number, tipo: string, arquivo: File) => {
    const form = new FormData()
    form.append('tipo_documento', tipo)
    form.append('arquivo', arquivo)
    return api.post<CondutorDocumento>(`/condutores/${condutorId}/documentos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  removerDocumento: (condutorId: number, docId: number) =>
    api.delete(`/condutores/${condutorId}/documentos/${docId}`),

  adicionarReferencia: (condutorId: number, dados: Partial<CondutorReferencia>) =>
    api.post<CondutorReferencia>(`/condutores/${condutorId}/referencias`, dados).then(r => r.data),
}
