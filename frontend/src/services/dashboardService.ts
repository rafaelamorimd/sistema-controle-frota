import api from './api'
import type { DashboardAlertas, DashboardResumo, DashboardRendaLiquida } from '../types'

export const dashboardService = {
  obterResumo: () => api.get<DashboardResumo>('/dashboard/resumo').then((r) => r.data),

  obterRendaLiquida: (params?: { mes?: string; veiculo_id?: number }) =>
    api.get<DashboardRendaLiquida>('/dashboard/renda-liquida', { params }).then((r) => r.data),

  obterAlertas: (limite?: number) =>
    api
      .get<DashboardAlertas>('/dashboard/alertas', {
        params: limite != null ? { limite } : undefined,
      })
      .then((r) => r.data),
}
