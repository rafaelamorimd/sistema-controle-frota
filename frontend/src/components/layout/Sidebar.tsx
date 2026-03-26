import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import BrandLogo from '../shared/BrandLogo'
import {
  Banknote,
  Car,
  ClipboardList,
  FileBarChart,
  FileText,
  Gauge,
  Gavel,
  LayoutDashboard,
  Package,
  Radio,
  Receipt,
  Settings,
  Users,
  Wrench,
  X,
} from 'lucide-react'

const menuItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
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
  useEffect(() => {
    if (!bolMobile) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bolAberto) onFechar()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [bolMobile, bolAberto, onFechar])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-secondary text-white shadow-sm'
        : 'text-white/85 hover:bg-white/10 hover:text-white'
    }`

  if (bolMobile) {
    return (
      <>
        {bolAberto && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onFechar}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-brand-primary text-white flex flex-col z-50 transform transition-transform duration-300 lg:hidden border-r border-white/10 ${
            bolAberto ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegacao"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <BrandLogo variant="sidebar" className="object-left" />
            </div>
            <button
              onClick={onFechar}
              className="p-1 hover:bg-white/10 rounded"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onFechar}
                className={linkClass}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
      </>
    )
  }

  return (
    <aside className="w-64 bg-brand-primary text-white flex flex-col border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <BrandLogo variant="sidebar" className="object-left" />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
