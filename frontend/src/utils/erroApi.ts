import type { AxiosError } from 'axios'

export function fnExtrairMensagemErroApi(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[] | string> }>
    const d = axiosErr.response?.data
    if (d && typeof d === 'object') {
      if (typeof d.message === 'string' && d.message) return d.message
      if (d.errors && typeof d.errors === 'object') {
        const arr = Object.values(d.errors).flatMap((v) => (Array.isArray(v) ? v : [String(v)]))
        if (arr.length) return arr.join(' ')
      }
    }
  }
  if (err instanceof Error) return err.message
  return 'Erro ao processar. Tente novamente.'
}
