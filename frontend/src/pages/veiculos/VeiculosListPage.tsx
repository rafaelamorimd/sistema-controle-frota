import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { veiculoService } from '../../services/veiculoService'
import type { Veiculo } from '../../types'

const statusColors: Record<string, string> = {
  DISPONIVEL: 'bg-green-100 text-green-700',
  ALUGADO: 'bg-blue-100 text-blue-700',
  MANUTENCAO: 'bg-yellow-100 text-yellow-700',
  INATIVO: 'bg-gray-100 text-gray-500',
}

export default function VeiculosListPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculoService.listar(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => veiculoService.excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  })

  const veiculos = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Veiculos</h2>
        <Link
          to="/veiculos/novo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} /> Novo Veiculo
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : veiculos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum veiculo cadastrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Placa</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Modelo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ano</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">KM Atual</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {veiculos.map((v: Veiculo) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">{v.placa}</td>
                  <td className="px-6 py-4 text-gray-700">{v.modelo}</td>
                  <td className="px-6 py-4 text-gray-700">{v.ano}</td>
                  <td className="px-6 py-4 text-gray-700">{v.km_atual.toLocaleString()} km</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[v.status] || ''}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/veiculos/${v.id}/editar`} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => { if (confirm('Excluir este veiculo?')) deleteMutation.mutate(v.id) }}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
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
