/** URL absoluta para arquivos em /storage quando a API devolve caminho relativo */
export function fnResolverUrlPublica(strUrl: string): string {
  if (/^https?:\/\//i.test(strUrl)) return strUrl
  const strBase = import.meta.env.VITE_API_URL
  if (!strBase) return strUrl
  const strNormalizado = strUrl.startsWith('/') ? strUrl : `/${strUrl}`
  return `${strBase.replace(/\/$/, '')}${strNormalizado}`
}

/** Data/hora em pt-BR (fuso America/Sao_Paulo), ex.: 27/03/2026 21:00:00 */
export function formatarDataHoraBr(strIso: string): string {
  const d = new Date(strIso)
  if (Number.isNaN(d.getTime())) return strIso
  const str = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  }).format(d)
  return str.replace(/\s*,\s*/, ' ')
}

export function formatarMoedaBrl(valor: string | number): string {
  const num = typeof valor === 'string' ? Number(valor) : valor
  if (Number.isNaN(num)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

export function formatarMesReferencia(strYyyyMm: string): string {
  const partes = strYyyyMm.split('-')
  const ano = Number(partes[0])
  const mes = Number(partes[1])
  if (Number.isNaN(ano) || Number.isNaN(mes)) return strYyyyMm
  return `${nomeMesPt(mes)} de ${ano}`
}

export function nomeMesPt(numMes: number): string {
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  return meses[numMes - 1] ?? String(numMes)
}
