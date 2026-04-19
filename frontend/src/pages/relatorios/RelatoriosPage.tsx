import { useQuery } from '@tanstack/react-query'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { useState } from 'react'
import { contratoService } from '../../services/contratoService'
import { relatorioService } from '../../services/relatorioService'
import { veiculoService } from '../../services/veiculoService'

export default function RelatoriosPage() {
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7))
  const [contratoId, setContratoId] = useState('')
  const [veiculoFiltro, setVeiculoFiltro] = useState('')

  const { data: contratosData } = useQuery({
    queryKey: ['contratos', 'rel'],
    queryFn: () => contratoService.listar({ por_pagina: 200 }),
  })

  const { data: veiculosData } = useQuery({
    queryKey: ['veiculos', 'rel'],
    queryFn: () => veiculoService.listar({ por_pagina: 200 }),
  })

  const contratos = contratosData?.data ?? []
  const veiculos = veiculosData?.data ?? []

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm">PDF (DomPDF), Excel (PhpSpreadsheet) e CSV</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileText size={20} className="text-brand-secondary" />
          Contrato (PDF)
        </h2>
        <select
          value={contratoId}
          onChange={(e) => setContratoId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Selecione o contrato</option>
          {contratos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.numero_contrato} — {c.veiculo?.placa}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!contratoId}
            onClick={() => contratoId && relatorioService.downloadPdfContrato(Number(contratoId))}
            className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover disabled:opacity-50"
          >
            PDF contrato
          </button>
          <button
            type="button"
            disabled={!contratoId}
            onClick={() =>
              contratoId && relatorioService.downloadPdfDesempenhoPrimeiroCiclo(Number(contratoId))
            }
            className="px-4 py-2 border border-brand-secondary text-brand-secondary rounded-lg hover:bg-brand-secondary/10 disabled:opacity-50 font-medium"
          >
            PDF desempenho (1º ciclo)
          </button>
        </div>
        <p className="text-xs text-gray-500">
          O desempenho consolida o 1º ciclo de 4 semanas (até o 5º pagamento), KM rodado, despesas pagas e
          manutenções concluídas no período.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileText size={20} className="text-brand-secondary" />
          Financeiro (PDF)
        </h2>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <select
          value={veiculoFiltro}
          onChange={(e) => setVeiculoFiltro(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Todos os veículos</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            relatorioService.downloadPdfFinanceiro(mes, veiculoFiltro ? Number(veiculoFiltro) : undefined)
          }
          className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-hover"
        >
          Baixar PDF
        </button>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-green-600" />
          Veículos
        </h2>
        <p className="text-sm text-gray-500">Exportação nativa .xlsx (recomendado) ou CSV legado.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => relatorioService.downloadExcelVeiculos()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Baixar Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => relatorioService.downloadCsvVeiculos()}
            className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50"
          >
            Baixar CSV
          </button>
        </div>
      </section>
    </div>
  )
}
