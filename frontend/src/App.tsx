import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import VeiculosListPage from './pages/veiculos/VeiculosListPage'
import VeiculoFormPage from './pages/veiculos/VeiculoFormPage'
import CondutoresListPage from './pages/condutores/CondutoresListPage'
import CondutorFormPage from './pages/condutores/CondutorFormPage'
import ContratosListPage from './pages/contratos/ContratosListPage'
import ContratoFormPage from './pages/contratos/ContratoFormPage'
import PagamentosPage from './pages/financeiro/PagamentosPage'
import DespesasPage from './pages/financeiro/DespesasPage'
import LeiturasKmPage from './pages/quilometragem/LeiturasKmPage'
import ManutencoesLayout from './pages/operacional/manutencoes/ManutencoesLayout'
import ManutencoesOrdensPage from './pages/operacional/manutencoes/ManutencoesOrdensPage'
import PecasPage from './pages/operacional/PecasPage'
import MultasPage from './pages/operacional/MultasPage'
import ChecklistRevisaoPage from './pages/revisao/ChecklistRevisaoPage'
import RevisaoCategoriasPage from './pages/revisao/RevisaoCategoriasPage'
import RastreadorPage from './pages/rastreador/RastreadorPage'
import RelatoriosPage from './pages/relatorios/RelatoriosPage'
import ConfiguracoesPage from './pages/configuracoes/ConfiguracoesPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-secondary" />
      </div>
    )
  }

  return isAuth() ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  const validateSession = useAuthStore((s) => s.validateSession)

  useEffect(() => {
    validateSession()
  }, [validateSession])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="veiculos" element={<VeiculosListPage />} />
        <Route path="veiculos/novo" element={<VeiculoFormPage />} />
        <Route path="veiculos/:id/editar" element={<VeiculoFormPage />} />
        <Route path="condutores" element={<CondutoresListPage />} />
        <Route path="condutores/novo" element={<CondutorFormPage />} />
        <Route path="condutores/:id/editar" element={<CondutorFormPage />} />
        <Route path="contratos" element={<ContratosListPage />} />
        <Route path="contratos/novo" element={<ContratoFormPage />} />
        <Route path="financeiro/pagamentos" element={<PagamentosPage />} />
        <Route path="financeiro/despesas" element={<DespesasPage />} />
        <Route path="quilometragem/leituras" element={<LeiturasKmPage />} />
        <Route path="operacional/manutencoes" element={<ManutencoesLayout />}>
          <Route index element={<ManutencoesOrdensPage />} />
          <Route path="checklist" element={<ChecklistRevisaoPage />} />
          <Route path="categorias" element={<RevisaoCategoriasPage />} />
        </Route>
        <Route path="operacional/pecas" element={<PecasPage />} />
        <Route path="operacional/multas" element={<MultasPage />} />
        <Route path="revisao/checklist" element={<Navigate to="/operacional/manutencoes/checklist" replace />} />
        <Route path="revisao/categorias" element={<Navigate to="/operacional/manutencoes/categorias" replace />} />
        <Route path="operacional/checklist" element={<Navigate to="/operacional/manutencoes/checklist" replace />} />
        <Route path="rastreador" element={<RastreadorPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="configuracoes" element={<ConfiguracoesPage />} />
      </Route>
    </Routes>
  )
}
