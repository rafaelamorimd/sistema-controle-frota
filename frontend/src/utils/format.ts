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
