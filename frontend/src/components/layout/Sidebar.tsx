import { useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../shared/BrandLogo'
import {
  Banknote,
  Car,
  ClipboardList,
  FileBarChart,
  FileText,
  Gauge,
  Gavel,
  Headphones,
  LayoutDashboard,
  LogOut,
  Package,
  Radio,
  Receipt,
  Settings,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'

const menuItems = [
  { to: '/', icon: LayoutDashboard, label: 'Visao Geral' },
  { to: '/veiculos', icon: Car, label: 'Veiculos' },
  { to: '/condutores', icon: Users, label: 'Condutores' },
  { to: '/contratos', icon: FileText, label: 'Contratos' },
  { to: '/financeiro/pagamentos', icon: Banknote, label: 'Pagamentos' },
  { to: '/financeiro/despesas', icon: Receipt, label: 'Despesas' },
  { to: '/quilometragem/leituras', icon: Gauge, label: 'Quilometragem' },
  { to: '/operacional/manutencoes', icon: Wrench, label: 'Manutencoes' },
  { to: '/operacional/pecas', icon: Package, label: 'Pecas' },
  { to: '/operacional/multas', icon: Gavel, label: 'Multas' },
  { to: '/operacional/checklist', icon: ClipboardList, label: 'Checklist' },
  { to: '/rastreador', icon: Radio, label: 'Rastreador' },
  { to: '/relatorios', icon: FileBarChart, label: 'Relatorios' },
  { to: '/configuracoes', icon: Settings, label: 'Configuracoes' },
]

interface SidebarProps {
  bolMobile: boolean
  bolAberto: boolean
  onFechar: () => void
}

export default function Sidebar({ bolMobile, bolAberto, onFechar }: SidebarProps) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  useEffect(() => {
    if (!bolMobile) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bolAberto) onFechar()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [bolMobile, bolAberto, onFechar])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white text-brand-primary shadow-sm border border-sidebar-border/80'
        : 'text-gray-600 hover:bg-white/70 hover:text-brand-primary'
    }`

  const iconClass = (isActive: boolean) => (isActive ? 'text-brand-secondary' : 'text-gray-500')

  async function handleSair() {
    try {
      await authService.logout()
    } catch {
      /* ignore */
    }
    logout()
    navigate('/login')
  }

  const conteudoRodape = (
    <div className="p-4 border-t border-sidebar-border space-y-3 shrink-0">
      <Link
        to="/veiculos/novo"
        onClick={() => bolMobile && onFechar()}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-secondary text-white text-sm font-semibold shadow-sm hover:bg-brand-secondary-hover transition-colors"
      >
        <Car size={18} strokeWidth={2.5} /> Novo Veiculo
      </Link>
      <a
        href="mailto:suporte@gefther.com.br"
        className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:text-brand-primary rounded-lg hover:bg-white/60 transition-colors"
      >
        <Headphones size={18} className="text-gray-400" />
        Suporte
      </a>
      <button
        type="button"
        onClick={() => {
          if (bolMobile) onFechar()
          void handleSair()
        }}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-600 hover:text-red-600 rounded-lg hover:bg-white/60 transition-colors text-left"
      >
        <LogOut size={18} className="text-gray-400" />
        Sair
      </button>
    </div>
  )

  const conteudoTopo = (
    <div className="p-4 border-b border-sidebar-border shrink-0">
      <div className="min-w-0">
        <BrandLogo variant="sidebar" className="object-left max-h-16" />
        <p className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-brand-primary/80 uppercase">
          Intelligent Fleet
        </p>
      </div>
    </div>
  )

  if (bolMobile) {
    return (
      <>
        {bolAberto && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onFechar}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-sidebar-surface text-gray-900 flex flex-col z-50 transform transition-transform duration-300 lg:hidden border-r border-sidebar-border shadow-xl ${
            bolAberto ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegacao"
        >
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <BrandLogo variant="sidebar" className="object-left max-h-14" />
              <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-brand-primary/80 uppercase">
                Intelligent Fleet
              </p>
            </div>
            <button
              onClick={onFechar}
              className="p-2 hover:bg-white/80 rounded-lg text-gray-600"
              aria-label="Fechar menu"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onFechar}
                className={linkClass}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} className={iconClass(isActive)} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          {conteudoRodape}
        </aside>
      </>
    )
  }

  return (
    <aside className="w-64 bg-sidebar-surface text-gray-900 flex flex-col border-r border-sidebar-border shrink-0">
      {conteudoTopo}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
            {({ isActive }) => (
              <>
                <item.icon size={20} className={iconClass(isActive)} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      {conteudoRodape}
    </aside>
  )
}
