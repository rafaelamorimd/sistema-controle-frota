import { Bell, LogOut, Menu, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../shared/BrandLogo'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'

const mapPerfilCargo: Record<string, string> = {
  ADMIN: 'Gerente de frota',
  OPERADOR: 'Operador',
  VISUALIZADOR: 'Visualizador',
}

function iniciais(strNome: string): string {
  const partes = strNome.trim().split(/\s+/)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

interface HeaderProps {
  onAbrirMenu: () => void
}

export default function Header({ onAbrirMenu }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      /* ignore */
    }
    logout()
    navigate('/login')
  }

  return (
    <header className="min-h-16 bg-white/90 backdrop-blur-md border-b border-brand-primary-border/60 flex items-center justify-between px-3 sm:px-6 py-3 gap-4 shadow-[0_1px_0_0_rgb(26_54_93/0.06)]">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="lg:hidden p-2 text-gray-600 hover:text-brand-primary hover:bg-brand-primary-muted rounded-xl shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <Link
          to="/"
          className="lg:hidden flex items-center shrink-0 rounded-lg px-1 py-0.5 hover:opacity-90"
          aria-label="GEFTHER - Início"
        >
          <BrandLogo variant="header" />
        </Link>
        <div className="hidden lg:block min-w-0" aria-hidden />
      </div>

      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <button
          type="button"
          className="relative p-2.5 text-gray-500 hover:text-brand-primary rounded-xl hover:bg-surface-muted transition-colors"
          aria-label="Notificacoes"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <Link
          to="/configuracoes"
          className="p-2.5 text-gray-500 hover:text-brand-primary rounded-xl hover:bg-surface-muted transition-colors"
          aria-label="Configurações"
        >
          <Settings size={20} />
        </Link>
        <div className="hidden sm:flex items-center pl-2 sm:pl-3 ml-1 border-l border-gray-200/90">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-surface/80 px-3 py-2 shadow-sm">
            <div className="text-right min-w-0 max-w-[140px] md:max-w-[200px]">
              <p className="text-sm font-semibold text-brand-primary truncate">{user?.name ?? 'Usuário'}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide truncate">
                {user?.perfil ? mapPerfilCargo[user.perfil] ?? user.perfil : ''}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-inner"
              aria-hidden
            >
              {user?.name ? iniciais(user.name) : '?'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="sm:hidden p-2.5 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50"
          title="Sair"
          aria-label="Sair"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
