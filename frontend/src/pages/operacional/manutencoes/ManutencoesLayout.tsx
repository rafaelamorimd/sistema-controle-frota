import { NavLink, Outlet } from 'react-router-dom'
import { Wrench } from 'lucide-react'

function strClasseAba({ isActive }: { isActive: boolean }) {
  return `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? 'bg-brand-secondary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
  }`
}

export default function ManutencoesLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wrench className="text-brand-secondary" size={28} />
          Manutenções
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ordens de serviço, checklist de revisão e categorias de inspeção
        </p>
      </div>

      <nav
        className="flex flex-wrap gap-2 border-b border-gray-200 pb-3"
        aria-label="Seções de manutenções"
      >
        <NavLink to="/operacional/manutencoes" end className={strClasseAba}>
          Ordens de serviço
        </NavLink>
        <NavLink to="/operacional/manutencoes/checklist" className={strClasseAba}>
          Checklist
        </NavLink>
        <NavLink to="/operacional/manutencoes/categorias" className={strClasseAba}>
          Categorias do checklist
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
