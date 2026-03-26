import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { veiculoService } from '../../services/veiculoService'

export default function VeiculoFormPage() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    placa: '', modelo: '', ano: new Date().getFullYear(), renavam: '',
    chassi: '', cor: '', combustivel: 'FLEX', kit_gas: false,
    vencimento_gnv: '', km_atual: 0, km_ultima_troca_oleo: 0,
    numero_rastreador: '', rastreador_ativo: false, valor_rastreador: '53',
    vencimento_ipva: '', vencimento_seguro: '', observacoes: '',
  })
  const [error, setError] = useState('')

  const { data: veiculo } = useQuery({
    queryKey: ['veiculo', id],
    queryFn: () => veiculoService.buscar(Number(id)),
    enabled: isEditing,
  })

  useEffect(() => {
    if (veiculo) {
      setForm({
        placa: veiculo.placa, modelo: veiculo.modelo, ano: veiculo.ano,
        renavam: veiculo.renavam, chassi: veiculo.chassi || '',
        cor: veiculo.cor, combustivel: veiculo.combustivel,
        kit_gas: veiculo.kit_gas, vencimento_gnv: veiculo.vencimento_gnv || '',
        km_atual: veiculo.km_atual, km_ultima_troca_oleo: veiculo.km_ultima_troca_oleo,
        numero_rastreador: veiculo.numero_rastreador || '',
        rastreador_ativo: veiculo.rastreador_ativo,
        valor_rastreador: veiculo.valor_rastreador,
        vencimento_ipva: veiculo.vencimento_ipva || '',
        vencimento_seguro: veiculo.vencimento_seguro || '',
        observacoes: veiculo.observacoes || '',
      })
    }
  }, [veiculo])

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      isEditing ? veiculoService.atualizar(Number(id), data) : veiculoService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      navigate('/veiculos')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erro ao salvar veiculo')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Veiculo' : 'Novo Veiculo'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
            <input value={form.placa} onChange={(e) => set('placa', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" maxLength={8} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
            <input value={form.modelo} onChange={(e) => set('modelo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
            <input type="number" value={form.ano} onChange={(e) => set('ano', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Renavam *</label>
            <input value={form.renavam} onChange={(e) => set('renavam', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" maxLength={11} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor *</label>
            <input value={form.cor} onChange={(e) => set('cor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Combustivel *</label>
            <select value={form.combustivel} onChange={(e) => set('combustivel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none">
              <option value="FLEX">Flex</option>
              <option value="GASOLINA">Gasolina</option>
              <option value="GNV">GNV</option>
              <option value="DIESEL">Diesel</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KM Atual *</label>
            <input type="number" value={form.km_atual} onChange={(e) => set('km_atual', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KM Ultima Troca de Oleo *</label>
            <input type="number" value={form.km_ultima_troca_oleo} onChange={(e) => set('km_ultima_troca_oleo', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.kit_gas} onChange={(e) => set('kit_gas', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary" />
            <span className="text-sm text-gray-700">Possui Kit Gas (GNV)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.rastreador_ativo} onChange={(e) => set('rastreador_ativo', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary" />
            <span className="text-sm text-gray-700">Rastreador Ativo</span>
          </label>
        </div>

        {form.kit_gas && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento GNV *</label>
            <input type="date" value={form.vencimento_gnv} onChange={(e) => set('vencimento_gnv', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
          <textarea value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={mutation.isPending}
            className="px-6 py-2 bg-brand-secondary text-white rounded-lg font-medium hover:bg-brand-secondary-hover disabled:opacity-50 transition-colors">
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate('/veiculos')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
