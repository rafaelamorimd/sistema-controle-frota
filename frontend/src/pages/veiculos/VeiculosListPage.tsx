import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { veiculoService } from '../../services/veiculoService'
import type { Veiculo } from '../../types'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'

const statusColors: Record<string, string> = {
  DISPONIVEL: 'bg-green-100 text-green-700',
  ALUGADO: 'bg-brand-primary-muted text-brand-primary',
  MANUTENCAO: 'bg-yellow-100 text-yellow-700',
  INATIVO: 'bg-gray-100 text-gray-500',
}

export default function VeiculosListPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculoService.listar(),
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => veiculoService.excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  })

  const veiculos = data?.data || []

  const arrColumns: Column<Veiculo>[] = [
    {
      strLabel: 'Placa',
      strKey: 'placa',
      render: (v) => <span className="font-mono font-medium text-gray-900">{v.placa}</span>,
    },
    {
      strLabel: 'Modelo',
      strKey: 'modelo',
      render: (v) => <span className="text-gray-700">{v.modelo}</span>,
    },
    {
      strLabel: 'Ano',
      strKey: 'ano',
      render: (v) => <span className="text-gray-700">{v.ano}</span>,
    },
    {
      strLabel: 'KM Atual',
      strKey: 'km_atual',
      render: (v) => <span className="text-gray-700">{v.km_atual.toLocaleString()} km</span>,
    },
    {
      strLabel: 'Status',
      strKey: 'status',
      render: (v) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[v.status] || ''}`}>
          {v.status}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Veículos</h2>
        <Link
          to="/veiculos/novo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover transition-colors text-sm font-medium"
        >
          <Plus size={18} /> Novo veículo
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ResponsiveTable
          arrColumns={arrColumns}
          arrData={veiculos}
          fnKeyExtractor={(v) => v.id}
          bolLoading={isLoading}
          strEmptyMessage="Nenhum veículo cadastrado."
          fnRenderCardHeader={(v) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-gray-900">{v.placa}</p>
                <p className="text-sm text-gray-500">{v.modelo} - {v.ano}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[v.status] || ''}`}>
                {v.status}
              </span>
            </div>
          )}
          fnRenderActions={(v) => (
            <div className="flex items-center gap-2">
              <Link
                to={`/veiculos/${v.id}/editar`}
                className="p-2 text-gray-500 hover:text-brand-secondary rounded-lg hover:bg-brand-secondary-muted"
                title="Editar veículo"
                aria-label="Editar veículo"
              >
                <Pencil size={16} aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => { if (confirm('Excluir este veículo?')) deleteMutation.mutate(v.id) }}
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Excluir veículo"
                aria-label="Excluir veículo"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          )}
        />
      </div>
    </div>
  )
}
