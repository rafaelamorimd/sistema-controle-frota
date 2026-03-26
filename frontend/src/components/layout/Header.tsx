import { LogOut, Bell, Menu } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../shared/BrandLogo'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'

interface HeaderProps {
  onAbrirMenu: () => void
}

export default function Header({ onAbrirMenu }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-brand-primary-border/40 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="lg:hidden p-2 text-gray-600 hover:text-brand-primary hover:bg-brand-primary-muted rounded-lg shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <Link
          to="/"
          className="flex items-center shrink-0 rounded-md px-1 py-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-brand-secondary focus-visible:outline-offset-2"
          aria-label="GEFTHER - Inicio"
        >
          <BrandLogo variant="header" />
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 text-gray-500 hover:text-brand-secondary rounded-lg hover:bg-brand-primary-muted">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm text-gray-700 hidden sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-brand-primary-muted"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
