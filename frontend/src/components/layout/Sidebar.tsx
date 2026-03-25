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
  Users,
  Wrench,
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
]

export default function Sidebar() {
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
