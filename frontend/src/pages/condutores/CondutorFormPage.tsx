import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { condutorService } from '../../services/condutorService'

/** API Laravel envia datas como ISO8601; `<input type="date">` exige `YYYY-MM-DD`. */
function strDataApiParaInputDate(str: string | null | undefined): string {
  if (!str) return ''
  return str.slice(0, 10)
}

export default function CondutorFormPage() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', email: '', endereco: '',
    numero_cnh: '', categoria_cnh: 'B', vencimento_cnh: '', observacoes: '',
  })
  const [error, setError] = useState('')

  const { data: condutor } = useQuery({
    queryKey: ['condutor', id],
    queryFn: () => condutorService.buscar(Number(id)),
    enabled: isEditing,
  })

  useEffect(() => {
    if (condutor) {
      setForm({
        nome: condutor.nome, cpf: condutor.cpf, telefone: condutor.telefone,
        email: condutor.email || '', endereco: condutor.endereco,
        numero_cnh: condutor.numero_cnh, categoria_cnh: condutor.categoria_cnh,
        vencimento_cnh: strDataApiParaInputDate(condutor.vencimento_cnh),
        observacoes: condutor.observacoes || '',
      })
    }
  }, [condutor])

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      isEditing ? condutorService.atualizar(Number(id), data) : condutorService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condutores'] })
      navigate('/condutores')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Erro ao salvar condutor'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let dados = form
    if (
      isEditing &&
      condutor &&
      !dados.vencimento_cnh.trim() &&
      condutor.vencimento_cnh
    ) {
      dados = {
        ...dados,
        vencimento_cnh: strDataApiParaInputDate(condutor.vencimento_cnh),
      }
    }
    mutation.mutate(dados)
  }

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar condutor' : 'Novo condutor'}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input value={form.nome} onChange={(e) => set('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
            <input value={form.cpf} onChange={(e) => set('cpf', e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" maxLength={11} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input value={form.telefone} onChange={(e) => set('telefone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereco *</label>
          <textarea value={form.endereco} onChange={(e) => set('endereco', e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número CNH *</label>
            <input value={form.numero_cnh} onChange={(e) => set('numero_cnh', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
            <select value={form.categoria_cnh} onChange={(e) => set('categoria_cnh', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none">
              <option value="A">A</option>
              <option value="AB">AB</option>
              <option value="AC">AC</option>
              <option value="AD">AD</option>
              <option value="AE">AE</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento CNH *</label>
            <input type="date" value={form.vencimento_cnh} onChange={(e) => set('vencimento_cnh', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={mutation.isPending}
            className="px-6 py-2 bg-brand-secondary text-white rounded-lg font-medium hover:bg-brand-secondary-hover disabled:opacity-50 transition-colors">
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate('/condutores')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
