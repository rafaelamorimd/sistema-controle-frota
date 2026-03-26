import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contratoService } from '../../services/contratoService'
import { veiculoService } from '../../services/veiculoService'
import { condutorService } from '../../services/condutorService'
import type { Veiculo, Condutor } from '../../types'

export default function ContratoFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    condutor_id: '', veiculo_id: '', data_inicio: '', data_fim: '',
    valor_semanal: '', dia_pagamento: 1, caucao: '', km_inicial: '',
    clausulas_adicionais: '',
  })
  const [error, setError] = useState('')

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', { status: 'DISPONIVEL' }],
    queryFn: () => veiculoService.listar({ status: 'DISPONIVEL', por_pagina: 100 }),
  })

  const { data: condutoresData } = useQuery({
    queryKey: ['condutores', { status: 'ATIVO' }],
    queryFn: () => condutorService.listar({ status: 'ATIVO', por_pagina: 100 }),
  })

  const veiculos: Veiculo[] = veiculosData?.data || []
  const condutores: Condutor[] = condutoresData?.data || []

  const mutation = useMutation({
    mutationFn: (data: any) => contratoService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      navigate('/contratos')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Erro ao criar contrato'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      condutor_id: Number(form.condutor_id),
      veiculo_id: Number(form.veiculo_id),
      valor_semanal: Number(form.valor_semanal),
      km_inicial: Number(form.km_inicial),
      caucao: form.caucao ? Number(form.caucao) : null,
    })
  }

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Novo Contrato</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condutor *</label>
            <select value={form.condutor_id} onChange={(e) => set('condutor_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required>
              <option value="">Selecione...</option>
              {condutores.map((c) => <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veiculo *</label>
            <select value={form.veiculo_id} onChange={(e) => set('veiculo_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required>
              <option value="">Selecione...</option>
              {veiculos.map((v) => <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicio *</label>
            <input type="date" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Semanal (R$) *</label>
            <input type="number" step="0.01" value={form.valor_semanal} onChange={(e) => set('valor_semanal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dia Pagamento *</label>
            <select value={form.dia_pagamento} onChange={(e) => set('dia_pagamento', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none">
              <option value={1}>Segunda</option><option value={2}>Terca</option>
              <option value={3}>Quarta</option><option value={4}>Quinta</option>
              <option value={5}>Sexta</option><option value={6}>Sabado</option>
              <option value={7}>Domingo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KM Inicial *</label>
            <input type="number" value={form.km_inicial} onChange={(e) => set('km_inicial', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caucao (R$)</label>
            <input type="number" step="0.01" value={form.caucao} onChange={(e) => set('caucao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clausulas Adicionais</label>
          <textarea value={form.clausulas_adicionais} onChange={(e) => set('clausulas_adicionais', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={mutation.isPending}
            className="px-6 py-2 bg-brand-secondary text-white rounded-lg font-medium hover:bg-brand-secondary-hover disabled:opacity-50 transition-colors">
            {mutation.isPending ? 'Criando...' : 'Criar Contrato'}
          </button>
          <button type="button" onClick={() => navigate('/contratos')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
