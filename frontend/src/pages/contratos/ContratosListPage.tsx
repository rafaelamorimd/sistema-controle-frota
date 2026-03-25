import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { contratoService } from '../../services/contratoService'
import type { Contrato } from '../../types'

const statusColors: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  ENCERRADO: 'bg-gray-100 text-gray-500',
  CANCELADO: 'bg-red-100 text-red-700',
  SUSPENSO: 'bg-yellow-100 text-yellow-700',
}

export default function ContratosListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contratos'],
    queryFn: () => contratoService.listar(),
  })

  const contratos = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contratos</h2>
        <Link to="/contratos/novo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={18} /> Novo Contrato
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : contratos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum contrato cadastrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Numero</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Condutor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Veiculo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Valor Semanal</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Inicio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contratos.map((c: Contrato) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">{c.numero_contrato}</td>
                  <td className="px-6 py-4 text-gray-700">{c.condutor?.nome || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{c.veiculo ? `${c.veiculo.modelo} - ${c.veiculo.placa}` : '-'}</td>
                  <td className="px-6 py-4 text-gray-700">R$ {Number(c.valor_semanal).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-700">{new Date(c.data_inicio).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>{c.status}</span>
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
