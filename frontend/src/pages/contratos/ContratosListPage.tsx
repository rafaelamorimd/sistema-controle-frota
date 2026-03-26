import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, FileText, RefreshCw } from 'lucide-react'
import Modal from '../../components/shared/Modal'
import { contratoService } from '../../services/contratoService'
import { relatorioService } from '../../services/relatorioService'
import type { Contrato } from '../../types'
import ResponsiveTable from '../../components/shared/ResponsiveTable'
import type { Column } from '../../components/shared/ResponsiveTable'

const statusColors: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  ENCERRADO: 'bg-gray-100 text-gray-500',
  CANCELADO: 'bg-red-100 text-red-700',
  SUSPENSO: 'bg-yellow-100 text-yellow-700',
}

export default function ContratosListPage() {
  const queryClient = useQueryClient()
  const [numBaixando, setNumBaixando] = useState<number | null>(null)
  const [numGerando, setNumGerando] = useState<number | null>(null)
  const [objContratoEncerrar, setObjContratoEncerrar] = useState<Contrato | null>(null)
  const [formEncerrar, setFormEncerrar] = useState({
    km_final: '',
    motivo_encerramento: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['contratos'],
    queryFn: () => contratoService.listar(),
  })

  const contratos = data?.data || []

  const handleBaixarPdf = async (id: number) => {
    setNumBaixando(id)
    try {
      await relatorioService.downloadPdfContrato(id)
    } catch (erro) {
      console.error('Erro ao baixar PDF:', erro)
      alert('Erro ao baixar PDF do contrato.')
    } finally {
      setNumBaixando(null)
    }
  }

  const handleGerarPdf = async (id: number) => {
    setNumGerando(id)
    try {
      const blob = await contratoService.gerarPdf(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contrato-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (erro) {
      console.error('Erro ao gerar PDF:', erro)
      alert('Erro ao gerar PDF do contrato.')
    } finally {
      setNumGerando(null)
    }
  }

  const encerrarMutation = useMutation({
    mutationFn: async () => {
      if (!objContratoEncerrar) return

      return contratoService.encerrar(objContratoEncerrar.id, {
        km_final: formEncerrar.km_final ? Number(formEncerrar.km_final) : undefined,
        motivo_encerramento: formEncerrar.motivo_encerramento || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      setObjContratoEncerrar(null)
      setFormEncerrar({ km_final: '', motivo_encerramento: '' })
    },
    onError: () => {
      alert('Erro ao encerrar contrato.')
    },
  })

  const abrirModalEncerrar = (objContrato: Contrato) => {
    setObjContratoEncerrar(objContrato)
    setFormEncerrar({ km_final: '', motivo_encerramento: '' })
  }

  const arrColumns: Column<Contrato>[] = [
    {
      strLabel: 'Numero',
      strKey: 'numero',
      render: (c) => <span className="font-mono font-medium text-gray-900">{c.numero_contrato}</span>,
    },
    {
      strLabel: 'Condutor',
      strKey: 'condutor',
      render: (c) => <span className="text-gray-700">{c.condutor?.nome || '-'}</span>,
    },
    {
      strLabel: 'Veiculo',
      strKey: 'veiculo',
      render: (c) => <span className="text-gray-700">{c.veiculo ? `${c.veiculo.modelo} - ${c.veiculo.placa}` : '-'}</span>,
    },
    {
      strLabel: 'Valor Semanal',
      strKey: 'valor',
      render: (c) => <span className="text-gray-700">R$ {Number(c.valor_semanal).toFixed(2)}</span>,
    },
    {
      strLabel: 'Inicio',
      strKey: 'inicio',
      render: (c) => <span className="text-gray-700">{new Date(c.data_inicio).toLocaleDateString('pt-BR')}</span>,
      bolHideMobile: true,
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
        <h2 className="text-2xl font-bold text-gray-900">Contratos</h2>
        <Link to="/contratos/novo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover transition-colors text-sm font-medium">
          <Plus size={18} /> Novo Contrato
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ResponsiveTable
          arrColumns={arrColumns}
          arrData={contratos}
          fnKeyExtractor={(c) => c.id}
          bolLoading={isLoading}
          strEmptyMessage="Nenhum contrato cadastrado."
          fnRenderCardHeader={(c) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-gray-900">{c.numero_contrato}</p>
                <p className="text-sm text-gray-500">{c.condutor?.nome || '-'}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>
                {c.status}
              </span>
            </div>
          )}
          fnRenderActions={(c) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleBaixarPdf(c.id)}
                disabled={numBaixando === c.id}
                className="text-brand-secondary hover:text-brand-secondary-hover disabled:opacity-50 flex items-center gap-1 text-sm"
                title="Baixar PDF"
              >
                <FileText size={16} />
                {numBaixando === c.id ? 'Baixando...' : 'PDF'}
              </button>
              <button
                onClick={() => handleGerarPdf(c.id)}
                disabled={numGerando === c.id}
                className="text-green-600 hover:text-green-800 disabled:opacity-50 flex items-center gap-1 text-sm"
                title="Gerar contrato"
              >
                <RefreshCw size={16} />
                {numGerando === c.id ? 'Gerando...' : 'Gerar'}
              </button>
              {c.status === 'ATIVO' && (
                <button
                  onClick={() => abrirModalEncerrar(c)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                  title="Encerrar contrato"
                >
                  Encerrar
                </button>
              )}
            </div>
          )}
        />
      </div>

      <Modal
        aberto={!!objContratoEncerrar}
        aoFechar={() => setObjContratoEncerrar(null)}
        titulo="Encerrar contrato"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Contrato: <span className="font-semibold">{objContratoEncerrar?.numero_contrato}</span>
          </p>
          <input
            type="number"
            min={0}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="KM final"
            value={formEncerrar.km_final}
            onChange={(e) => setFormEncerrar((f) => ({ ...f, km_final: e.target.value }))}
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Motivo de encerramento"
            rows={3}
            value={formEncerrar.motivo_encerramento}
            onChange={(e) => setFormEncerrar((f) => ({ ...f, motivo_encerramento: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => encerrarMutation.mutate()}
            disabled={encerrarMutation.isPending}
            className="w-full py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {encerrarMutation.isPending ? 'Encerrando...' : 'Confirmar encerramento'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
