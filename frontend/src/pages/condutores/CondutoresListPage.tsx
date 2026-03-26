import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { condutorService } from '../../services/condutorService'
import type { Condutor } from '../../types'

const statusColors: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  INATIVO: 'bg-gray-100 text-gray-500',
  BLOQUEADO: 'bg-red-100 text-red-700',
}

export default function CondutoresListPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['condutores'],
    queryFn: () => condutorService.listar(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => condutorService.excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['condutores'] }),
  })

  const condutores = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Condutores</h2>
        <Link to="/condutores/novo"
          className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover transition-colors text-sm font-medium">
          <Plus size={18} /> Novo Condutor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : condutores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum condutor cadastrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">CPF</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Telefone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">CNH</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {condutores.map((c: Condutor) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.nome}</td>
                  <td className="px-6 py-4 text-gray-700 font-mono">{c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</td>
                  <td className="px-6 py-4 text-gray-700">{c.telefone}</td>
                  <td className="px-6 py-4 text-gray-700">{c.categoria_cnh}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/condutores/${c.id}/editar`} className="p-2 text-gray-500 hover:text-brand-secondary rounded-lg hover:bg-brand-secondary-muted">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => { if (confirm('Excluir este condutor?')) deleteMutation.mutate(c.id) }}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
