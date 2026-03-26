import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
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

  if (bolMobile) {
    return (
      <>
        {bolAberto && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onFechar}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${
            bolAberto ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegacao"
        >
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-wide">Gefther</h1>
              <p className="text-xs text-gray-400 mt-1">Gestao de Frota</p>
            </div>
            <button
              onClick={onFechar}
              className="p-1 hover:bg-gray-800 rounded"
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
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
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
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-wide">Gefther</h1>
        <p className="text-xs text-gray-400 mt-1">Gestao de Frota</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
