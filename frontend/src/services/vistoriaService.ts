import api from './api'
import type { Vistoria, VistoriaFoto } from '../types'

export const vistoriaService = {
  listarPorContrato: (contratoId: number) =>
    api.get<Vistoria[]>(`/contratos/${contratoId}/vistorias`).then(r => r.data),

  buscar: (id: number) =>
    api.get<Vistoria>(`/vistorias/${id}`).then(r => r.data),

  criar: (dados: Partial<Vistoria>) =>
    api.post<Vistoria>('/vistorias', dados).then(r => r.data),

  adicionarItens: (vistoriaId: number, itens: Array<{ item_verificado: string; estado: string; observacao?: string }>) =>
    api.post<Vistoria>(`/vistorias/${vistoriaId}/itens`, { itens }).then(r => r.data),

  uploadFoto: (vistoriaId: number, foto: File, itemId?: number, descricao?: string) => {
    const form = new FormData()
    form.append('foto', foto)
    if (itemId) form.append('vistoria_item_id', String(itemId))
    if (descricao) form.append('descricao', descricao)
    return api.post<VistoriaFoto>(`/vistorias/${vistoriaId}/fotos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  finalizar: (vistoriaId: number) =>
    api.patch<Vistoria>(`/vistorias/${vistoriaId}/finalizar`).then(r => r.data),
}
