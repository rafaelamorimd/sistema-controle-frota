import type { RevisaoCategoria } from '../types'

export type StatusInspecaoItem = 'ok' | 'verificar' | 'trocar'

export function fnNormalizarStatusLegado(strValor: string): StatusInspecaoItem {
  const t = strValor.trim().toLowerCase()
  if (t === 'ok') return 'ok'
  if (t === 'verificar') return 'verificar'
  if (t === 'trocar') return 'trocar'
  return 'ok'
}

export function fnInicializarEstadoItens(
  arrCategorias: RevisaoCategoria[],
): Record<string, { strStatus: StatusInspecaoItem; strObs: string }> {
  const obj: Record<string, { strStatus: StatusInspecaoItem; strObs: string }> = {}
  for (const cat of arrCategorias) {
    for (const item of cat.itens_checklist ?? []) {
      obj[item.chave] = { strStatus: 'ok', strObs: '' }
    }
  }
  return obj
}

export function fnMontarItensVerificadosJson(
  objEstado: Record<string, { strStatus: StatusInspecaoItem; strObs: string }>,
  arrCategorias: RevisaoCategoria[],
): Record<string, unknown> {
  const objSaida: Record<string, unknown> = {}
  for (const cat of arrCategorias) {
    for (const item of cat.itens_checklist ?? []) {
      const st = objEstado[item.chave]
      if (!st) continue
      if (st.strStatus === 'ok') {
        objSaida[item.chave] = { status: 'ok' }
      } else {
        const objEntrada: { status: StatusInspecaoItem; obs?: string } = {
          status: st.strStatus,
        }
        const strObs = st.strObs.trim()
        if (strObs) objEntrada.obs = strObs
        objSaida[item.chave] = objEntrada
      }
    }
  }
  return objSaida
}

export function fnMapearJsonParaEstado(
  objItens: Record<string, unknown>,
  arrCategorias: RevisaoCategoria[],
): Record<string, { strStatus: StatusInspecaoItem; strObs: string }> {
  const objBase = fnInicializarEstadoItens(arrCategorias)
  for (const strChave of Object.keys(objItens)) {
    if (!(strChave in objBase)) continue
    const mix = objItens[strChave]
    if (typeof mix === 'string') {
      objBase[strChave] = {
        strStatus: fnNormalizarStatusLegado(mix),
        strObs: '',
      }
    } else if (mix && typeof mix === 'object' && 'status' in mix) {
      const obj = mix as { status: string; obs?: string }
      objBase[strChave] = {
        strStatus: fnNormalizarStatusLegado(String(obj.status)),
        strObs: typeof obj.obs === 'string' ? obj.obs : '',
      }
    }
  }
  return objBase
}

export function fnMontarMapaChaveLabel(arrCategorias: RevisaoCategoria[]): Map<string, string> {
  const mapa = new Map<string, string>()
  for (const cat of arrCategorias) {
    for (const item of cat.itens_checklist ?? []) {
      mapa.set(item.chave, item.label)
    }
  }
  return mapa
}

export function fnResumoChecklistHumano(
  objItens: Record<string, unknown>,
  arrCategorias: RevisaoCategoria[],
): string {
  const mapa = fnMontarMapaChaveLabel(arrCategorias)
  const arrChaves = Object.keys(objItens)
  if (arrChaves.length === 0) return '—'
  const arrPartes = arrChaves.slice(0, 8).map((strChave) => {
    const strNome = mapa.get(strChave) ?? strChave
    const valor = objItens[strChave]
    if (typeof valor === 'string') {
      return `${strNome}: ${valor}`
    }
    if (valor && typeof valor === 'object' && 'status' in (valor as object)) {
      const obj = valor as { status: string; obs?: string }
      const strObs = obj.obs ? ` (${obj.obs})` : ''
      return `${strNome}: ${obj.status}${strObs}`
    }
    return strNome
  })
  return arrPartes.join(' · ') + (arrChaves.length > 8 ? '…' : '')
}
