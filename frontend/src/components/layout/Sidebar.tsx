import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import BrandLogo from '../shared/BrandLogo'
import {
  Banknote,
  Car,
  ClipboardList,
  FileBarChart,
  FileText,
  FolderTree,
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
  ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'

type MenuLink = { kind: 'link'; to: string; icon: LucideIcon; label: string }
type MenuGrupo = { kind: 'grupo'; strTitulo: string; icon: LucideIcon; arrFilhos: MenuLink[] }

const arrMenuEntradas: (MenuLink | MenuGrupo)[] = [
  { kind: 'link', to: '/', icon: LayoutDashboard, label: 'Visão geral' },
  { kind: 'link', to: '/veiculos', icon: Car, label: 'Veículos' },
  { kind: 'link', to: '/condutores', icon: Users, label: 'Condutores' },
  { kind: 'link', to: '/contratos', icon: FileText, label: 'Contratos' },
  { kind: 'link', to: '/financeiro/pagamentos', icon: Banknote, label: 'Pagamentos' },
  { kind: 'link', to: '/financeiro/despesas', icon: Receipt, label: 'Despesas' },
  { kind: 'link', to: '/quilometragem/leituras', icon: Gauge, label: 'Quilometragem' },
  {
    kind: 'grupo',
    strTitulo: 'Manutenções',
    icon: Wrench,
    arrFilhos: [
      { kind: 'link', to: '/operacional/manutencoes', icon: Wrench, label: 'Ordens de serviço' },
      { kind: 'link', to: '/operacional/manutencoes/checklist', icon: ClipboardList, label: 'Checklist' },
      {
        kind: 'link',
        to: '/operacional/manutencoes/categorias',
        icon: FolderTree,
        label: 'Categorias do checklist',
      },
    ],
  },
  { kind: 'link', to: '/operacional/pecas', icon: Package, label: 'Peças' },
  { kind: 'link', to: '/operacional/multas', icon: Gavel, label: 'Multas' },
  { kind: 'link', to: '/rastreador', icon: Radio, label: 'Rastreador' },
  { kind: 'link', to: '/relatorios', icon: FileBarChart, label: 'Relatórios' },
  { kind: 'link', to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

interface SidebarProps {
  bolMobile: boolean
  bolAberto: boolean
  onFechar: () => void
}

export default function Sidebar({ bolMobile, bolAberto, onFechar }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()
  const [objGruposAbertos, setObjGruposAbertos] = useState<Record<string, boolean | undefined>>({})

  useEffect(() => {
    arrMenuEntradas.forEach((entrada) => {
      if (entrada.kind !== 'grupo') return
      const bolFilhoAtivo = entrada.arrFilhos.some((f) => location.pathname.startsWith(f.to))
      if (!bolFilhoAtivo) {
        setObjGruposAbertos((prev) => {
          if (prev[entrada.strTitulo] === undefined) return prev
          const next = { ...prev }
          delete next[entrada.strTitulo]
          return next
        })
      }
    })
  }, [location.pathname])

  useEffect(() => {
    if (!bolMobile) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bolAberto) onFechar()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [bolMobile, bolAberto, onFechar])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-white text-brand-secondary shadow-sm border border-sidebar-border/80'
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
        <Car size={18} strokeWidth={2.5} /> Novo veículo
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
    <div className="p-4 border-b border-sidebar-border shrink-0 flex justify-center">
      <div className="min-w-0 flex justify-center w-full">
        <BrandLogo variant="sidebar" className="max-h-16 mx-auto" />
      </div>
    </div>
  )

  const fnRenderNav = (onNavigate?: () => void) => (
    <>
      {arrMenuEntradas.map((entrada) => {
        if (entrada.kind === 'link') {
          return (
            <NavLink
              key={entrada.to}
              to={entrada.to}
              end={entrada.to === '/'}
              onClick={onNavigate}
              className={linkClass}
            >
              {({ isActive }) => (
                <>
                  <entrada.icon size={20} className={iconClass(isActive)} />
                  {entrada.label}
                </>
              )}
            </NavLink>
          )
        }
        const bolGrupoAtivo = entrada.arrFilhos.some((f) => location.pathname.startsWith(f.to))
        const bolAberto =
          objGruposAbertos[entrada.strTitulo] !== undefined
            ? Boolean(objGruposAbertos[entrada.strTitulo])
            : bolGrupoAtivo
        const IconPai = entrada.icon
        const strClasseCabecalhoGrupo = bolGrupoAtivo
          ? 'bg-white text-brand-secondary shadow-sm border border-sidebar-border/80'
          : 'text-gray-600 hover:bg-white/70 hover:text-brand-primary'
        return (
          <div key={entrada.strTitulo} className="pt-1 pb-0.5">
            <button
              type="button"
              onClick={() => {
                setObjGruposAbertos((prev) => {
                  const bolAtual =
                    prev[entrada.strTitulo] !== undefined
                      ? Boolean(prev[entrada.strTitulo])
                      : bolGrupoAtivo
                  return { ...prev, [entrada.strTitulo]: !bolAtual }
                })
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${strClasseCabecalhoGrupo}`}
              aria-expanded={bolAberto}
            >
              <IconPai
                size={20}
                className={bolGrupoAtivo ? 'text-brand-secondary shrink-0' : 'text-gray-500 shrink-0'}
              />
              <span className="flex-1 min-w-0">{entrada.strTitulo}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                  bolAberto ? 'rotate-0' : '-rotate-90'
                }`}
                aria-hidden
              />
            </button>
            {bolAberto ? (
              <div className="mt-1 space-y-0.5 pl-2 ml-3 border-l border-gray-200/90">
                {entrada.arrFilhos.map((filho) => (
                  <NavLink
                    key={filho.to}
                    to={filho.to}
                    end={filho.to === '/operacional/manutencoes'}
                    onClick={onNavigate}
                    className={linkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <filho.icon size={20} className={iconClass(isActive)} />
                        {filho.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </>
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
          <div className="relative p-4 border-b border-sidebar-border flex items-center justify-center min-h-18">
            <BrandLogo variant="sidebar" className="max-h-14 mx-auto" />
            <button
              type="button"
              onClick={onFechar}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/80 rounded-lg text-gray-600"
              aria-label="Fechar menu"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">{fnRenderNav(onFechar)}</nav>
          {conteudoRodape}
        </aside>
      </>
    )
  }

  return (
    <aside className="w-64 bg-sidebar-surface text-gray-900 flex flex-col border-r border-sidebar-border shrink-0">
      {conteudoTopo}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">{fnRenderNav()}</nav>
      {conteudoRodape}
    </aside>
  )
}
