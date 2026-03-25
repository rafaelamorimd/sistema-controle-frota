import type { AxiosResponse } from 'axios'
import api from './api'

function baixarBlob(res: AxiosResponse<Blob>, nomeFallback: string) {
  const blob = res.data
  let nome = nomeFallback
  const cd = res.headers['content-disposition'] as string | undefined
  if (cd) {
    const m = /filename="?([^";]+)"?/i.exec(cd)
    if (m) nome = m[1]
  }
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  window.URL.revokeObjectURL(url)
}

export const relatorioService = {
  downloadPdfContrato: (contratoId: number) =>
    api
      .get(`/relatorios/contrato/${contratoId}/pdf`, { responseType: 'blob' })
      .then((r) => baixarBlob(r, `contrato-${contratoId}.pdf`)),

  downloadPdfFinanceiro: (mes?: string, veiculoId?: number) =>
    api
      .get('/relatorios/financeiro/pdf', {
        responseType: 'blob',
        params: { mes, veiculo_id: veiculoId },
      })
      .then((r) => baixarBlob(r, 'resumo-financeiro.pdf')),

  downloadExcelVeiculos: () =>
    api
      .get('/relatorios/veiculos/excel', { responseType: 'blob' })
      .then((r) => baixarBlob(r, 'veiculos.xlsx')),

  downloadCsvVeiculos: () =>
    api.get('/relatorios/veiculos/csv', { responseType: 'blob' }).then((r) => baixarBlob(r, 'veiculos.csv')),
}
