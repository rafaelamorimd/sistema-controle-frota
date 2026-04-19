import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { condutorService } from '../../services/condutorService'
import type { Condutor } from '../../types'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'

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

  const arrColumns: Column<Condutor>[] = [
    {
      strLabel: 'Nome',
      strKey: 'nome',
      render: (c) => <span className="font-medium text-gray-900">{c.nome}</span>,
    },
    {
      strLabel: 'CPF',
      strKey: 'cpf',
      render: (c) => (
        <span className="text-gray-700 font-mono">
          {c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
        </span>
      ),
    },
    {
      strLabel: 'Telefone',
      strKey: 'telefone',
      render: (c) => <span className="text-gray-700">{c.telefone}</span>,
    },
    {
      strLabel: 'CNH',
      strKey: 'cnh',
      render: (c) => <span className="text-gray-700">{c.categoria_cnh}</span>,
    },
    {
      strLabel: 'Status',
      strKey: 'status',
      render: (c) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>
          {c.status}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Condutores</h2>
        <Link to="/condutores/novo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover transition-colors text-sm font-medium">
          <Plus size={18} /> Novo Condutor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ResponsiveTable
          arrColumns={arrColumns}
          arrData={condutores}
          fnKeyExtractor={(c) => c.id}
          bolLoading={isLoading}
          strEmptyMessage="Nenhum condutor cadastrado."
          fnRenderCardHeader={(c) => (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                {c.nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{c.nome}</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>
                  {c.status}
                </span>
              </div>
            </div>
          )}
          fnRenderActions={(c) => (
            <div className="flex items-center gap-2">
              <Link
                to={`/condutores/${c.id}/editar`}
                className="p-2 text-gray-500 hover:text-brand-secondary rounded-lg hover:bg-brand-secondary-muted"
                title="Editar condutor"
                aria-label="Editar condutor"
              >
                <Pencil size={16} aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => { if (confirm('Excluir este condutor?')) deleteMutation.mutate(c.id) }}
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Excluir condutor"
                aria-label="Excluir condutor"
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
