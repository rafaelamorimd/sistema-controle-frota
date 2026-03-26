import { LogOut, Bell, Menu } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
      <button
        onClick={onAbrirMenu}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm text-gray-700 hidden sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
