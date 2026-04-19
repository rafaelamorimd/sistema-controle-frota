import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useMediaQuery } from '../../utils/useMediaQuery'

export default function Layout() {
  const [bolMenuAberto, setBolMenuAberto] = useState(false)
  const bolDesktop = useMediaQuery('(min-width: 1024px)')
  const location = useLocation()

  useEffect(() => {
    if (bolDesktop) setBolMenuAberto(false)
  }, [bolDesktop])

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar 
        bolMobile={!bolDesktop}
        bolAberto={bolMenuAberto}
        onFechar={() => setBolMenuAberto(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onAbrirMenu={() => setBolMenuAberto(true)} />
        <main className="gef-main-canvas flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-linear-to-b from-surface via-surface to-brand-primary-muted/30">
          <div key={location.pathname} className="gef-animate-main-enter max-w-[1800px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
