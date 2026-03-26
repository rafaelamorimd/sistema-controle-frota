import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, FileText, RefreshCw } from 'lucide-react'
import { contratoService } from '../../services/contratoService'
import { relatorioService } from '../../services/relatorioService'
import type { Contrato } from '../../types'

const statusColors: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  ENCERRADO: 'bg-gray-100 text-gray-500',
  CANCELADO: 'bg-red-100 text-red-700',
  SUSPENSO: 'bg-yellow-100 text-yellow-700',
}

export default function ContratosListPage() {
  const [numBaixando, setNumBaixando] = useState<number | null>(null)
  const [numGerando, setNumGerando] = useState<number | null>(null)

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contratos</h2>
        <Link to="/contratos/novo"
          className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover transition-colors text-sm font-medium">
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acoes</th>
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
                  <td className="px-6 py-4">
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
